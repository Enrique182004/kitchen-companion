import { supabase } from "@/lib/supabase";
import type { Recipe, RecipeIngredient } from "@/types";

type DbIngredient = {
  id: string;
  recipe_id: string;
  name: string;
  quantity: number;
  unit: string | null;
};

function toIngredient(row: DbIngredient): RecipeIngredient {
  return { id: row.id, name: row.name, quantity: row.quantity, unit: row.unit };
}

export const recipeService = {
  async fetchRecipes(userId: string): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from("recipes")
      .select("*, recipe_ingredients(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => {
      const { recipe_ingredients, ...row } = r as unknown as {
        recipe_ingredients: DbIngredient[];
      } & Omit<Recipe, "ingredients">;
      return {
        ...row,
        ingredients: (recipe_ingredients ?? []).map(toIngredient),
      };
    });
  },

  async addRecipe(
    recipe: Omit<Recipe, "created_at" | "updated_at"> & { id: string },
  ): Promise<Recipe> {
    const { ingredients, ...recipeRow } = recipe;
    const { data, error } = await supabase
      .from("recipes")
      .insert(recipeRow)
      .select("*")
      .single();
    if (error) throw error;
    if (ingredients.length > 0) {
      const { error: ingErr } = await supabase
        .from("recipe_ingredients")
        .insert(
          ingredients.map((i) => ({
            id: i.id,
            recipe_id: recipe.id,
            name: i.name,
            quantity: i.quantity,
            unit: i.unit,
          })),
        );
      if (ingErr) throw ingErr;
    }
    return { ...(data as Omit<Recipe, "ingredients">), ingredients };
  },

  async updateRecipe(id: string, changes: Partial<Recipe>): Promise<Recipe> {
    const { ingredients, ...recipeChanges } = changes;
    const { data, error } = await supabase
      .from("recipes")
      .update({ ...recipeChanges, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    if (ingredients !== undefined) {
      await supabase.from("recipe_ingredients").delete().eq("recipe_id", id);
      if (ingredients.length > 0) {
        await supabase.from("recipe_ingredients").insert(
          ingredients.map((i) => ({
            id: i.id,
            recipe_id: id,
            name: i.name,
            quantity: i.quantity,
            unit: i.unit,
          })),
        );
      }
    }
    const { data: ings } = await supabase
      .from("recipe_ingredients")
      .select("*")
      .eq("recipe_id", id);
    return {
      ...(data as Omit<Recipe, "ingredients">),
      ingredients: ((ings ?? []) as DbIngredient[]).map(toIngredient),
    };
  },

  async deleteRecipe(id: string): Promise<void> {
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) throw error;
  },

  async toggleFavorite(id: string, is_favorite: boolean): Promise<Recipe> {
    return recipeService.updateRecipe(id, { is_favorite });
  },
};
