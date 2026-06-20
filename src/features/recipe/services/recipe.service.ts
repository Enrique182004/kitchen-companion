import { supabase } from "@/lib/supabase";
import type { Recipe } from "@/types";

export const recipeService = {
  async fetchRecipes(userId: string): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Recipe[];
  },

  async addRecipe(
    recipe: Omit<Recipe, "created_at" | "updated_at"> & { id: string },
  ): Promise<Recipe> {
    const { data, error } = await supabase
      .from("recipes")
      .insert(recipe)
      .select("*")
      .single();
    if (error) throw error;
    return data as Recipe;
  },

  async updateRecipe(id: string, changes: Partial<Recipe>): Promise<Recipe> {
    const { data, error } = await supabase
      .from("recipes")
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data as Recipe;
  },

  async deleteRecipe(id: string): Promise<void> {
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) throw error;
  },

  async toggleFavorite(id: string, is_favorite: boolean): Promise<Recipe> {
    return recipeService.updateRecipe(id, { is_favorite });
  },
};
