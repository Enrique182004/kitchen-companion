export type Unit =
  | "tsp"
  | "tbsp"
  | "cup"
  | "fl_oz"
  | "pint"
  | "quart"
  | "gallon"
  | "ml"
  | "L"
  | "oz"
  | "lb"
  | "g"
  | "kg";

export const UNIT_LABELS: Record<Unit, string> = {
  tsp: "tsp",
  tbsp: "tbsp",
  cup: "cup",
  fl_oz: "fl oz",
  pint: "pint",
  quart: "quart",
  gallon: "gallon",
  ml: "ml",
  L: "L",
  oz: "oz",
  lb: "lb",
  g: "g",
  kg: "kg",
};

const VOLUME_TO_ML: Record<string, number> = {
  tsp: 4.92892,
  tbsp: 14.7868,
  cup: 236.588,
  fl_oz: 29.5735,
  pint: 473.176,
  quart: 946.353,
  gallon: 3785.41,
  ml: 1,
  L: 1000,
};
const WEIGHT_TO_G: Record<string, number> = {
  oz: 28.3495,
  lb: 453.592,
  g: 1,
  kg: 1000,
};

export function canConvert(from: string, to: string): boolean {
  return (
    (from in VOLUME_TO_ML && to in VOLUME_TO_ML) ||
    (from in WEIGHT_TO_G && to in WEIGHT_TO_G)
  );
}

export function convert(
  amount: number,
  from: string,
  to: string,
): number | null {
  if (from === to) return amount;
  if (from in VOLUME_TO_ML && to in VOLUME_TO_ML) {
    return (amount * VOLUME_TO_ML[from]) / VOLUME_TO_ML[to];
  }
  if (from in WEIGHT_TO_G && to in WEIGHT_TO_G) {
    return (amount * WEIGHT_TO_G[from]) / WEIGHT_TO_G[to];
  }
  return null;
}

export const VOLUME_UNITS: Unit[] = [
  "tsp",
  "tbsp",
  "cup",
  "fl_oz",
  "pint",
  "quart",
  "gallon",
  "ml",
  "L",
];
export const WEIGHT_UNITS: Unit[] = ["oz", "lb", "g", "kg"];
