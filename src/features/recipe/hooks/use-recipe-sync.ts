import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/auth.store";
import { useRecipeStore } from "../recipe.store";
import { recipeService } from "../services/recipe.service";
import type { Recipe } from "@/types";
import type { RecipeFormValues } from "../recipe.store";

const isDemo = !import.meta.env.VITE_SUPABASE_URL;

const SEED_RECIPES: Omit<RecipeFormValues, never>[] = [
  {
    title: "Carne de res con brócoli",
    description: "Carne en cuadritos salteada con brócoli y salsa Maggi.",
    servings: 3,
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    tags: "carne, brócoli, sartén",
    ingredients: [
      { name: "Brócoli", quantity: 1, unit: "cabeza" },
      { name: "Carne de res en cuadritos (bistec)", quantity: 500, unit: "g" },
      { name: "Maizena", quantity: 2, unit: "cdas" },
      { name: "Salsa Maggi", quantity: 1, unit: "al gusto" },
      { name: "Aceite", quantity: 2, unit: "cdas" },
      { name: "Sal", quantity: 1, unit: "al gusto" },
      { name: "Pimienta", quantity: 1, unit: "al gusto" },
    ],
    instructions: [
      { text: "Sazonar el brócoli con aceite y reservar." },
      {
        text: "Poner los cuadritos de carne en un bowl y mezclar con poca maizena.",
      },
      {
        text: "En una sartén calentar aceite y cocinar la carne con sal y pimienta hasta que esté lista.",
      },
      {
        text: "Agregar el brócoli a la carne y revolver poco a poco con salsa Maggi. ¡Listo!",
      },
    ],
  },
  {
    title: "Pasta Alfredo",
    description: "Espagueti cremoso con pollo y salsa de crema licuada.",
    servings: 4,
    prep_time_minutes: 10,
    cook_time_minutes: 25,
    tags: "pasta, pollo, cremoso",
    ingredients: [
      { name: "Espagueti", quantity: 500, unit: "g" },
      { name: "Crema", quantity: 1, unit: "lata" },
      { name: "Pimienta", quantity: 1, unit: "al gusto" },
      { name: "Knorsuiza", quantity: 1, unit: "al gusto" },
      { name: "Pollo (en trocitos)", quantity: 2, unit: "pechugas" },
      { name: "Sal", quantity: 1, unit: "al gusto" },
    ],
    instructions: [
      { text: "Cocer el espagueti en agua con poca sal. Escurrir y reservar." },
      { text: "Licuar la crema con pimienta y Knorsuiza." },
      {
        text: "Sazonar el pollo en trocitos con pimienta y sal, cocinar hasta que esté listo.",
      },
      {
        text: "En un refractario combinar el espagueti y el pollo, agregar la crema licuada y mezclar bien.",
      },
    ],
  },
  {
    title: "Tortas ahogadas",
    description: "Salsa de chile guajillo con crema para bañar tortas.",
    servings: 4,
    prep_time_minutes: 15,
    cook_time_minutes: 30,
    tags: "tortas, salsa, mexicano, picante",
    ingredients: [
      { name: "Chiles guajillo", quantity: 8, unit: "" },
      { name: "Chiles de árbol (opcional)", quantity: 2, unit: "" },
      { name: "Dientes de ajo", quantity: 2, unit: "" },
      { name: "Cebolla", quantity: 0.5, unit: "pieza" },
      { name: "Tomates", quantity: 3, unit: "" },
      { name: "Crema ácida o media crema", quantity: 1, unit: "bote mediano" },
      { name: "Pierna española o lomo de cerdo", quantity: 500, unit: "g" },
      { name: "Sal o Knorsuiza", quantity: 1, unit: "al gusto" },
    ],
    instructions: [
      {
        text: "Hervir juntos los chiles, ajo, cebolla y tomates en agua. Una vez hervidos, licuar.",
      },
      {
        text: "Poner la salsa en una sartén honda y llevar a hervor. Sazonar con sal o Knorsuiza.",
      },
      {
        text: "Al soltar el hervor, agregar la crema ácida o media crema. Batir constantemente.",
      },
      {
        text: "Cocinar la pierna o lomo de cerdo en sartén con agua, sal y cebolla.",
      },
      {
        text: "Puede sustituirse la carne por hamburguesa, jamón o solo aguacate.",
      },
    ],
  },
  {
    title: "Pay de queso",
    description: "Pastel de queso cremoso y fácil, listo en 50 minutos.",
    servings: 8,
    prep_time_minutes: 10,
    cook_time_minutes: 50,
    tags: "postre, queso, horno",
    ingredients: [
      { name: "Lechera grande", quantity: 1, unit: "lata" },
      { name: "Huevos", quantity: 2, unit: "" },
      { name: "Queso Philadelphia", quantity: 2, unit: "paquetes" },
      { name: "Vainilla", quantity: 2, unit: "cdas" },
    ],
    instructions: [
      {
        text: "Moler todos los ingredientes en la licuadora hasta obtener mezcla homogénea.",
      },
      {
        text: "Verter en un refractario previamente preparado con base de galleta.",
      },
      { text: "Hornear durante 50 minutos." },
    ],
  },
  {
    title: "Papas al horno con crema",
    description: "Papas en capas con crema, catsup y queso al horno.",
    servings: 4,
    prep_time_minutes: 15,
    cook_time_minutes: 40,
    tags: "papas, horno, crema, guarnición",
    ingredients: [
      { name: "Papas", quantity: 4, unit: "" },
      { name: "Crema de leche", quantity: 0.25, unit: "taza" },
      { name: "Catsup", quantity: 0.25, unit: "taza" },
      { name: "Mantequilla", quantity: 1, unit: "cdta" },
      { name: "Queso rayado", quantity: 1, unit: "al gusto" },
      { name: "Sal y pimienta", quantity: 1, unit: "al gusto" },
    ],
    instructions: [
      { text: "Pelar las papas y cortar en láminas finas." },
      { text: "Mezclar la crema con la catsup." },
      {
        text: "Colocar la mitad de las papas en el refractario, salpimentar. Agregar el resto y volver a salpimentar.",
      },
      {
        text: "Verter la crema por encima, cubrir bien y tapar con papel de aluminio.",
      },
      { text: "Hornear a 250° durante 30 minutos." },
      {
        text: "Agregar queso rayado y mantequilla, hornear 10 minutos más sin el aluminio.",
      },
    ],
  },
  {
    title: "Fajitas de pollo en Salsa de Chipotle",
    description:
      "Fajitas de pollo asadas bañadas en cremosa salsa de chipotle con leche Carnation.",
    servings: 4,
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    tags: "pollo, chipotle, salsa, fajitas",
    ingredients: [
      { name: "Leche Carnation", quantity: 0.5, unit: "lata" },
      { name: "Dadito de Sazón sabor cebolla-ajo", quantity: 1, unit: "" },
      { name: "Cubo de caldo de pollo", quantity: 1, unit: "" },
      { name: "Chiles chipotles de lata", quantity: 2, unit: "" },
      { name: "Agua", quantity: 1.5, unit: "tza" },
      { name: "Fajitas de pollo, asadas", quantity: 450, unit: "g" },
    ],
    instructions: [
      {
        text: "Licua todos los ingredientes, excepto el pollo.",
      },
      {
        text: "Cuela y calienta de 10 a 15 min o hasta que espese tomando la consistencia deseada, moviendo constantemente para evitar que se pegue.",
      },
      {
        text: "Retira del fuego, baña las fajitas con la salsa y listo.",
      },
    ],
  },
  {
    title: "Pasta de Chipotle con Tocino Philadelphia",
    description:
      "Tallarines con cremosa salsa de philadelphia chipotle y tocino frito.",
    servings: 4,
    prep_time_minutes: 15,
    cook_time_minutes: 15,
    tags: "pasta, chipotle, tocino, philadelphia, tallarines",
    ingredients: [
      { name: "Philadelphia sabor chipotle", quantity: 190, unit: "g" },
      { name: "Tocino frito en trozos", quantity: 0.5, unit: "tza" },
      { name: "Leche", quantity: 2, unit: "tzas" },
      { name: "Caldo de pollo", quantity: 1, unit: "tza" },
      { name: "Cebolla", quantity: 0.75, unit: "tza" },
      { name: "Aceite", quantity: 2, unit: "cdas" },
      { name: "Tallarines", quantity: 600, unit: "g" },
    ],
    instructions: [
      {
        text: "Calentar una sartén con aceite y freír la cebolla hasta dorar.",
      },
      {
        text: "Licuar todos los ingredientes de la salsa, calentar en una cacerola hasta que suelte el hervor y servir sobre los tallarines cocidos.",
      },
      {
        text: "Decorar con trocitos de tocino y servir.",
      },
    ],
  },
];

export function useRecipeSync() {
  const user = useAuthStore((state) => state.user);
  const {
    recipes,
    setRecipes,
    createRecipe,
    updateRecipe,
    removeRecipe,
    restoreRecipe,
    toggleFavorite,
  } = useRecipeStore();

  useEffect(() => {
    if (isDemo || !user) return;

    const userId = user.id;

    const buildLocalRecipes = (): Recipe[] => {
      const now = new Date().toISOString();
      return SEED_RECIPES.map((r) => ({
        id: crypto.randomUUID(),
        user_id: userId,
        title: r.title,
        description: r.description || null,
        image_url: null,
        servings: r.servings || null,
        prep_time_minutes: r.prep_time_minutes || null,
        cook_time_minutes: r.cook_time_minutes || null,
        tags: r.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        ingredients: r.ingredients
          .filter((i) => i.name.trim())
          .map((i) => ({
            id: crypto.randomUUID(),
            name: i.name.trim(),
            quantity: Number(i.quantity) || 1,
            unit: i.unit.trim() || null,
          })),
        instructions: r.instructions.map((s) => s.text.trim()).filter(Boolean),
        is_favorite: false,
        created_at: now,
        updated_at: now,
      }));
    };

    recipeService
      .fetchRecipes(userId)
      .then(async (fetched) => {
        if (fetched.length > 0) {
          setRecipes(fetched);
          return;
        }
        // Show locally first so UI is responsive immediately
        const localRecipes = buildLocalRecipes();
        setRecipes(localRecipes);
        // Then persist to Supabase in background
        const saved: Recipe[] = [];
        for (const recipe of localRecipes) {
          try {
            const s = await recipeService.addRecipe(recipe);
            saved.push(s);
          } catch (e) {
            console.error("[recipe seed] failed to save", recipe.title, e);
            saved.push(recipe);
          }
        }
        setRecipes(saved);
      })
      .catch((e) => {
        console.error("[recipe fetch] failed", e);
        // Fetch failed — still show seed recipes locally
        setRecipes(buildLocalRecipes());
      });

    const onFocus = () => {
      recipeService
        .fetchRecipes(userId)
        .then((fetched) => {
          // Only overwrite if Supabase returned data; keep local recipes otherwise
          if (fetched.length > 0) setRecipes(fetched);
        })
        .catch(() => {});
    };
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [user, setRecipes]);

  const handleCreate = async (values: RecipeFormValues) => {
    if (isDemo) {
      createRecipe(values);
      return;
    }
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const recipe: Recipe = {
      id,
      user_id: user!.id,
      title: values.title.trim(),
      description: values.description.trim() || null,
      image_url: null,
      servings: values.servings || null,
      prep_time_minutes: values.prep_time_minutes || null,
      cook_time_minutes: values.cook_time_minutes || null,
      tags: values.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      ingredients: values.ingredients
        .filter((i) => i.name.trim())
        .map((i) => ({
          id: crypto.randomUUID(),
          name: i.name.trim(),
          quantity: Number(i.quantity) || 1,
          unit: i.unit.trim() || null,
        })),
      instructions: values.instructions
        .map((s) => s.text.trim())
        .filter(Boolean),
      is_favorite: false,
      created_at: now,
      updated_at: now,
    };
    const saved = await recipeService.addRecipe(recipe);
    setRecipes([saved, ...recipes]);
  };

  const handleUpdate = async (id: string, values: RecipeFormValues) => {
    if (isDemo) {
      updateRecipe(id, values);
      return;
    }
    const existing = recipes.find((r) => r.id === id);
    const changes: Partial<Recipe> = {
      title: values.title.trim(),
      description: values.description.trim() || null,
      servings: values.servings || null,
      prep_time_minutes: values.prep_time_minutes || null,
      cook_time_minutes: values.cook_time_minutes || null,
      tags: values.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      ingredients: values.ingredients
        .filter((i) => i.name.trim())
        .map((i, idx) => ({
          id: existing?.ingredients[idx]?.id ?? crypto.randomUUID(),
          name: i.name.trim(),
          quantity: Number(i.quantity) || 1,
          unit: i.unit.trim() || null,
        })),
      instructions: values.instructions
        .map((s) => s.text.trim())
        .filter(Boolean),
    };
    const saved = await recipeService.updateRecipe(id, changes);
    setRecipes(recipes.map((r) => (r.id === id ? saved : r)));
  };

  const handleRemove = async (id: string) => {
    if (isDemo) {
      removeRecipe(id);
      return;
    }
    await recipeService.deleteRecipe(id);
    setRecipes(recipes.filter((r) => r.id !== id));
  };

  const handleRestore = async (recipe: Recipe) => {
    if (isDemo) {
      restoreRecipe(recipe);
      return;
    }
    if (recipes.some((r) => r.id === recipe.id)) return;
    const saved = await recipeService.addRecipe(recipe);
    setRecipes([saved, ...recipes]);
  };

  const handleToggleFavorite = async (id: string) => {
    if (isDemo) {
      toggleFavorite(id);
      return;
    }
    const recipe = recipes.find((r) => r.id === id);
    if (!recipe) return;
    const saved = await recipeService.toggleFavorite(id, !recipe.is_favorite);
    setRecipes(recipes.map((r) => (r.id === id ? saved : r)));
  };

  return {
    recipes,
    createRecipe: handleCreate,
    updateRecipe: handleUpdate,
    removeRecipe: handleRemove,
    restoreRecipe: handleRestore,
    toggleFavorite: handleToggleFavorite,
  };
}
