import { supabase } from "@/lib/supabase";
import type {
  GroceryItem,
  GroceryItemInsert,
  GroceryItemUpdate,
} from "@/types";

const SELECT = "*, categories(id, name)";

export const groceryService = {
  async fetchItems(userId: string): Promise<GroceryItem[]> {
    const { data, error } = await supabase
      .from("grocery_items")
      .select(SELECT)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as GroceryItem[];
  },

  async addItem(item: GroceryItemInsert): Promise<GroceryItem> {
    const { data, error } = await supabase
      .from("grocery_items")
      .insert(item)
      .select(SELECT)
      .single();
    if (error) throw error;
    return data as GroceryItem;
  },

  async updateItem(
    id: string,
    changes: GroceryItemUpdate,
  ): Promise<GroceryItem> {
    const { data, error } = await supabase
      .from("grocery_items")
      .update(changes)
      .eq("id", id)
      .select(SELECT)
      .single();
    if (error) throw error;
    return data as GroceryItem;
  },

  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase
      .from("grocery_items")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  async markPurchased(id: string, purchased: boolean): Promise<GroceryItem> {
    return groceryService.updateItem(id, { purchased });
  },

  async bulkMarkPurchased(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from("grocery_items")
      .update({ purchased: true })
      .in("id", ids);
    if (error) throw error;
  },
};
