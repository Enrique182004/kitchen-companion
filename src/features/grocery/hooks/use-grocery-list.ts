import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/features/auth/auth.store";
import { useGroceryStore } from "../grocery.store";
import { groceryService } from "../services/grocery.service";
import type { GroceryItemInsert, GroceryItemUpdate } from "@/types";

export function useGroceryList() {
  const user = useAuthStore((state) => state.user);
  const { setItems, setLoading } = useGroceryStore();

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    groceryService
      .fetchItems(user.id)
      .then(setItems)
      .finally(() => setLoading(false));

    const channel = supabase
      .channel("grocery_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "grocery_items",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          groceryService.fetchItems(user.id).then(setItems);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, setItems, setLoading]);

  return {
    add: (item: Omit<GroceryItemInsert, "user_id">) =>
      groceryService.addItem({ ...item, user_id: user!.id }),
    update: (id: string, changes: GroceryItemUpdate) =>
      groceryService.updateItem(id, changes),
    remove: (id: string) => groceryService.deleteItem(id),
    markPurchased: (id: string, purchased: boolean) =>
      groceryService.markPurchased(id, purchased),
    bulkMarkPurchased: (ids: string[]) => groceryService.bulkMarkPurchased(ids),
  };
}
