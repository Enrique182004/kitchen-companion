import { supabase } from "@/lib/supabase";
import type { PantryItem } from "@/types";

export const pantryService = {
  async fetchItems(userId: string): Promise<PantryItem[]> {
    const { data, error } = await supabase
      .from("pantry_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as PantryItem[];
  },

  async addItem(
    item: Omit<PantryItem, "id" | "created_at" | "updated_at">,
  ): Promise<PantryItem> {
    const { data, error } = await supabase
      .from("pantry_items")
      .insert(item)
      .select("*")
      .single();
    if (error) throw error;
    return data as PantryItem;
  },

  async updateItem(
    id: string,
    changes: Partial<PantryItem>,
  ): Promise<PantryItem> {
    const { data, error } = await supabase
      .from("pantry_items")
      .update(changes)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data as PantryItem;
  },

  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase.from("pantry_items").delete().eq("id", id);
    if (error) throw error;
  },
};
