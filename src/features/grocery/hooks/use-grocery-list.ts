import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/features/auth/auth.store";
import { useGroceryStore } from "../grocery.store";
import { useLibraryStore } from "@/features/library/library.store";
import { groceryService } from "../services/grocery.service";
import type { GroceryItemFormValues } from "@/lib/zod-schemas";
import type { GroceryItemInsert, GroceryItemUpdate } from "@/types";

const isDemo = !import.meta.env.VITE_SUPABASE_URL;

export function useGroceryList() {
  const user = useAuthStore((state) => state.user);
  const setItems = useGroceryStore((s) => s.setItems);
  const setLoading = useGroceryStore((s) => s.setLoading);
  const addItem = useGroceryStore((s) => s.addItem);
  const updateItem = useGroceryStore((s) => s.updateItem);
  const removeItem = useGroceryStore((s) => s.removeItem);

  useEffect(() => {
    if (isDemo || !user) return;

    setLoading(true);
    groceryService
      .fetchItems(user.id)
      .then(setItems)
      .catch(() => {})
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
        () =>
          groceryService
            .fetchItems(user.id)
            .then(setItems)
            .catch(() => {}),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, setItems, setLoading]);

  const add = async (values: GroceryItemFormValues) => {
    // Imperative read — no hook subscription to library store
    useLibraryStore.getState().saveFromForm(values);

    if (isDemo) {
      addItem({
        ...values,
        id: crypto.randomUUID(),
        user_id: "demo",
        actual_price: null,
        purchased: false,
        unit: values.unit ?? null,
        store: values.store ?? null,
        notes: values.notes ?? null,
        estimated_price: values.estimated_price ?? null,
        category_id: values.category_id ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return;
    }
    if (!user) return;
    return groceryService.addItem({
      ...(values as Omit<GroceryItemInsert, "user_id">),
      user_id: user.id,
    });
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
