export const config = { runtime: "edge" };

interface RawRecipeLD {
  "@type"?: string | string[];
  name?: string;
  description?: string;
  recipeYield?: string | number | string[];
  prepTime?: string;
  cookTime?: string;
  recipeIngredient?: string[];
  recipeInstructions?:
    | string[]
    | Array<{ "@type"?: string; text?: string }>
    | string;
}

interface ParsedIngredient {
  name: string;
  quantity: number;
  unit: string;
}

interface RecipeResponse {
  title: string;
  description: string;
  servings: number | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  ingredients: ParsedIngredient[];
  instructions: string[];
}

function parseISO8601Duration(duration: string): number | null {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
  if (!match) return null;
  const hours = parseInt(match[1] ?? "0", 10);
  const minutes = parseInt(match[2] ?? "0", 10);
  const seconds = parseInt(match[3] ?? "0", 10);
  return hours * 60 + minutes + Math.round(seconds / 60);
}

const UNITS = [
  "tablespoons",
  "tablespoon",
  "tbsp",
  "tbsps",
  "teaspoons",
  "teaspoon",
  "tsp",
  "tsps",
  "cups",
  "cup",
  "c",
  "fluid ounces",
  "fluid ounce",
  "fl oz",
  "pints",
  "pint",
  "pt",
  "quarts",
  "quart",
  "qt",
  "gallons",
  "gallon",
  "gal",
  "milliliters",
  "milliliter",
  "ml",
  "mls",
  "liters",
  "liter",
  "l",
  "ounces",
  "ounce",
  "oz",
  "pounds",
  "pound",
  "lb",
  "lbs",
  "grams",
  "gram",
  "g",
  "kilograms",
  "kilogram",
  "kg",
  "pinch",
  "pinches",
  "dash",
  "dashes",
  "handful",
  "handfuls",
  "bunch",
  "bunches",
  "slice",
  "slices",
  "piece",
  "pieces",
  "can",
  "cans",
  "package",
  "packages",
  "pkg",
  "clove",
  "cloves",
  "stalk",
  "stalks",
  "head",
  "heads",
  "ear",
  "ears",
  "inch",
  "inches",
];

const UNIT_PATTERN = UNITS.sort((a, b) => b.length - a.length)
  .map((u) => u.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");

function parseIngredient(raw: string): ParsedIngredient {
  const normalized = raw.trim().replace(/\s+/g, " ");

  const fractionMap: Record<string, number> = {
    "½": 0.5,
    "⅓": 1 / 3,
    "⅔": 2 / 3,
    "¼": 0.25,
    "¾": 0.75,
    "⅛": 0.125,
    "⅜": 0.375,
    "⅝": 0.625,
    "⅞": 0.875,
  };

  let text = normalized;
  for (const [char, val] of Object.entries(fractionMap)) {
    text = text.replace(char, ` ${val}`);
  }

  const numRegex =
    /^(\d+(?:\.\d+)?)\s*(?:\/\s*(\d+(?:\.\d+)?))?\s*(?:\+\s*(\d+(?:\.\d+)?)\s*(?:\/\s*(\d+(?:\.\d+)?))?)?/;
  const numMatch = text.match(numRegex);

  let quantity = 1;
  let rest = text;

  if (numMatch) {
    const whole = parseFloat(numMatch[1]);
    const fracNum = numMatch[2] ? parseFloat(numMatch[2]) : null;
    const addWhole = numMatch[3] ? parseFloat(numMatch[3]) : null;
    const addFrac = numMatch[4] ? parseFloat(numMatch[4]) : null;

    if (fracNum !== null) {
      quantity = whole / fracNum;
    } else {
      quantity = whole;
    }
    if (addWhole !== null) {
      quantity += addFrac !== null ? addWhole / addFrac : addWhole;
    }

    rest = text.slice(numMatch[0].length).trim();
  }

  const unitRegex = new RegExp(`^(${UNIT_PATTERN})s?\\b\\.?`, "i");
  const unitMatch = rest.match(unitRegex);
  let unit = "";

  if (unitMatch) {
    unit = unitMatch[1].toLowerCase();
    rest = rest.slice(unitMatch[0].length).trim();
  }

  rest = rest
    .replace(/^of\s+/i, "")
    .replace(/^,.*$/, "")
    .trim();

  const name = rest || normalized;

  return { name, quantity: isNaN(quantity) ? 1 : quantity, unit };
}

function parseServings(
  yield_: string | number | string[] | undefined,
): number | null {
  if (yield_ == null) return null;
  const raw = Array.isArray(yield_) ? yield_[0] : yield_;
  const n = parseInt(String(raw), 10);
  return isNaN(n) ? null : n;
}

function extractInstructions(raw: RawRecipeLD["recipeInstructions"]): string[] {
  if (!raw) return [];
  if (typeof raw === "string") {
    return raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return raw
    .map((item) => {
      if (typeof item === "string") return item.trim();
      return (item.text ?? "").trim();
    })
    .filter(Boolean);
}

function isRecipeType(type: string | string[] | undefined): boolean {
  if (!type) return false;
  const types = Array.isArray(type) ? type : [type];
  return types.some((t) => t === "Recipe");
}

export default async function handler(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response(JSON.stringify({ error: "Missing url parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let html: string;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RecipeBot/1.0)" },
    });
    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch URL: ${res.status}` }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }
    html = await res.text();
  } catch {
    return new Response(JSON.stringify({ error: "Failed to fetch URL" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ldJsonMatches = [
    ...html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ];

  let recipe: RawRecipeLD | null = null;

  for (const match of ldJsonMatches) {
    try {
      const parsed = JSON.parse(match[1]) as
        | RawRecipeLD
        | { "@graph"?: RawRecipeLD[] }
        | RawRecipeLD[];

      if (Array.isArray(parsed)) {
        const found = parsed.find((item) => isRecipeType(item["@type"]));
        if (found) {
          recipe = found;
          break;
        }
      } else if ("@graph" in parsed && Array.isArray(parsed["@graph"])) {
        const found = parsed["@graph"].find((item) =>
          isRecipeType(item["@type"]),
        );
        if (found) {
          recipe = found;
          break;
        }
      } else if (isRecipeType((parsed as RawRecipeLD)["@type"])) {
        recipe = parsed as RawRecipeLD;
        break;
      }
    } catch {
      // malformed JSON-LD block — skip
    }
  }

  if (!recipe) {
    return new Response(
      JSON.stringify({ error: "No Recipe JSON-LD found on page" }),
      { status: 422, headers: { "Content-Type": "application/json" } },
    );
  }

  const response: RecipeResponse = {
    title: recipe.name ?? "",
    description: recipe.description ?? "",
    servings: parseServings(recipe.recipeYield),
    prep_time_minutes: recipe.prepTime
      ? parseISO8601Duration(recipe.prepTime)
      : null,
    cook_time_minutes: recipe.cookTime
      ? parseISO8601Duration(recipe.cookTime)
      : null,
    ingredients: (recipe.recipeIngredient ?? []).map(parseIngredient),
    instructions: extractInstructions(recipe.recipeInstructions),
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
