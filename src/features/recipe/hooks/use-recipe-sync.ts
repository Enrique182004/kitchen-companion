import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/auth.store";
import { useRecipeStore } from "../recipe.store";
import { recipeService } from "../services/recipe.service";
import type { Recipe } from "@/types";
import type { RecipeFormValues } from "../recipe.store";

const isDemo = !import.meta.env.VITE_SUPABASE_URL;

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

    recipeService.fetchRecipes(user.id).then(setRecipes);

    const onFocus = () => {
      recipeService.fetchRecipes(user.id).then(setRecipes);
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
