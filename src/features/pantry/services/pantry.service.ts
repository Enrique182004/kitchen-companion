import { supabase } from "@/lib/supabase";
import type { PantryItem } from "@/types";

type DbItem = Omit<
  PantryItem,
  "id" | "created_at" | "updated_at" | "category_id"
>;

function toDbItem(
  item: Omit<PantryItem, "id" | "created_at" | "updated_at">,
): DbItem {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { category_id, ...rest } = item;
  return rest;
}

export const pantryService = {
  async fetchItems(userId: string): Promise<PantryItem[]> {
    const { data, error } = await supabase
      .from("pantry_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(
      (row) => ({ ...row, category_id: null }) as PantryItem,
    );
  },

  async addItem(
    item: Omit<PantryItem, "id" | "created_at" | "updated_at">,
  ): Promise<PantryItem> {
    const { data, error } = await supabase
      .from("pantry_items")
      .insert(toDbItem(item))
      .select("*")
      .single();
    if (error) throw error;
    return { ...data, category_id: null } as PantryItem;
  },

  async updateItem(
    id: string,
    changes: Partial<PantryItem>,
  ): Promise<PantryItem> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { category_id, ...dbChanges } = changes;
    const { data, error } = await supabase
      .from("pantry_items")
      .update(dbChanges)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return { ...data, category_id: null } as PantryItem;
  },

  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase.from("pantry_items").delete().eq("id", id);
    if (error) throw error;
  },
};
