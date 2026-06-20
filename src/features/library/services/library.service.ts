import { supabase } from "@/lib/supabase";
import type { LibraryItem } from "@/types";

export const libraryService = {
  async fetchItems(userId: string): Promise<LibraryItem[]> {
    const { data, error } = await supabase
      .from("library_items")
      .select("*")
      .eq("user_id", userId)
      .order("times_added", { ascending: false });
    if (error) throw error;
    return data as LibraryItem[];
  },

  async upsertItem(
    item: Omit<LibraryItem, "id" | "created_at"> & { user_id: string },
  ): Promise<LibraryItem> {
    const { data, error } = await supabase
      .from("library_items")
      .upsert(item, { onConflict: "user_id,name" })
      .select()
      .single();
    if (error) throw error;
    return data as LibraryItem;
  },

  async updateItem(
    id: string,
    changes: Partial<LibraryItem>,
  ): Promise<LibraryItem> {
    const { data, error } = await supabase
      .from("library_items")
      .update(changes)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as LibraryItem;
  },

  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase
      .from("library_items")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  async toggleFavorite(id: string, is_favorite: boolean): Promise<LibraryItem> {
    return libraryService.updateItem(id, { is_favorite });
  },
};
