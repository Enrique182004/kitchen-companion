import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/features/auth/auth.store";
import { useGroceryStore } from "../grocery.store";
import { groceryService } from "../services/grocery.service";
import type { GroceryItemInsert, GroceryItemUpdate } from "@/types";

const isDemo = !import.meta.env.VITE_SUPABASE_URL;

export function useGroceryList() {
  const user = useAuthStore((state) => state.user);
  const { setItems, setLoading, addItem, updateItem, removeItem } =
    useGroceryStore();

  useEffect(() => {
    if (isDemo || !user) return;

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
        () => groceryService.fetchItems(user.id).then(setItems),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, setItems, setLoading]);

  const add = async (item: Omit<GroceryItemInsert, "user_id">) => {
    if (isDemo) {
      addItem({
        ...item,
        id: crypto.randomUUID(),
        user_id: "demo",
        actual_price: null,
        purchased: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Parameters<typeof addItem>[0]);
      return;
    }
    return groceryService.addItem({ ...item, user_id: user!.id });
  };

  const update = async (id: string, changes: GroceryItemUpdate) => {
    if (isDemo) {
      updateItem(id, changes);
      return;
    }
    return groceryService.updateItem(id, changes);
  };

  const remove = (id: string) => {
    if (isDemo) {
      removeItem(id);
      return;
    }
    return groceryService.deleteItem(id);
  };

  const markPurchased = (id: string, purchased: boolean) => {
    if (isDemo) {
      updateItem(id, { purchased });
      return;
    }
    return groceryService.markPurchased(id, purchased);
  };

  const bulkMarkPurchased = (ids: string[], purchased: boolean) => {
    if (isDemo) {
      ids.forEach((id) => updateItem(id, { purchased }));
      return;
    }
    return groceryService.bulkMarkPurchased(ids);
  };

  return { add, update, remove, markPurchased, bulkMarkPurchased };
}
