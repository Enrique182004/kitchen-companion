import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Recipe, RecipeIngredient } from "@/types";

export interface RecipeFormValues {
  title: string;
  description: string;
  servings: number | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  tags: string;
  ingredients: Array<{ name: string; quantity: number; unit: string }>;
  instructions: Array<{ text: string }>;
}

interface RecipeState {
  recipes: Recipe[];
  setRecipes: (recipes: Recipe[]) => void;
  createRecipe: (values: RecipeFormValues) => void;
  updateRecipe: (id: string, values: RecipeFormValues) => void;
  removeRecipe: (id: string) => void;
  restoreRecipe: (recipe: Recipe) => void;
  toggleFavorite: (id: string) => void;
}

function formToRecipe(values: RecipeFormValues, id: string): Recipe {
  const now = new Date().toISOString();
  const ingredients: RecipeIngredient[] = values.ingredients
    .filter((i) => i.name.trim())
    .map((i) => ({
      id: crypto.randomUUID(),
      name: i.name.trim(),
      quantity: Number(i.quantity) || 1,
      unit: i.unit.trim() || null,
    }));

  return {
    id,
    user_id: "demo",
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
    ingredients,
    instructions: values.instructions.map((s) => s.text.trim()).filter(Boolean),
    is_favorite: false,
    created_at: now,
    updated_at: now,
  };
}

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      recipes: [],

      setRecipes: (recipes) => set({ recipes }),

      createRecipe: (values) =>
        set((state) => ({
          recipes: [
            ...state.recipes,
            formToRecipe(values, crypto.randomUUID()),
          ],
        })),

      updateRecipe: (id, values) =>
        set((state) => ({
          recipes: state.recipes.map((r) => {
            if (r.id !== id) return r;
            const ingredients: RecipeIngredient[] = values.ingredients
              .filter((i) => i.name.trim())
              .map((i, idx) => ({
                // Preserve existing ID by position so checked state survives edits
                id: r.ingredients[idx]?.id ?? crypto.randomUUID(),
                name: i.name.trim(),
                quantity: Number(i.quantity) || 1,
                unit: i.unit.trim() || null,
              }));
            return {
              ...r,
              title: values.title.trim(),
              description: values.description.trim() || null,
              servings: values.servings || null,
              prep_time_minutes: values.prep_time_minutes || null,
              cook_time_minutes: values.cook_time_minutes || null,
              tags: values.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
              ingredients,
              instructions: values.instructions
                .map((s) => s.text.trim())
                .filter(Boolean),
              updated_at: new Date().toISOString(),
            };
          }),
        })),

      removeRecipe: (id) =>
        set((state) => ({
          recipes: state.recipes.filter((r) => r.id !== id),
        })),

      restoreRecipe: (recipe) =>
        set((state) => ({
          recipes: state.recipes.some((r) => r.id === recipe.id)
            ? state.recipes
            : [...state.recipes, recipe],
        })),

      toggleFavorite: (id) =>
        set((state) => ({
          recipes: state.recipes.map((r) =>
            r.id === id ? { ...r, is_favorite: !r.is_favorite } : r,
          ),
        })),
    }),
    { name: "kitchen-companion-recipes" },
  ),
);

export function useRecipes() {
  return useRecipeStore((s) => s.recipes);
}
