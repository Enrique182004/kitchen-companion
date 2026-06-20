import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/auth.store";
import { usePantryStore } from "../pantry.store";
import { pantryService } from "../services/pantry.service";
import type { PantryItem } from "@/types";
import type { PantryFormValues } from "../pantry.store";

const isDemo = !import.meta.env.VITE_SUPABASE_URL;

export function usePantrySync() {
  const user = useAuthStore((state) => state.user);
  const { items, setItems, addItem, updateItem, removeItem, restoreItem } =
    usePantryStore();

  useEffect(() => {
    if (isDemo || !user) return;

    pantryService.fetchItems(user.id).then(setItems);

    const handleFocus = () => pantryService.fetchItems(user.id).then(setItems);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [user, setItems]);

  const add = async (values: PantryFormValues) => {
    if (isDemo) {
      addItem(values);
      return;
    }
    const item = await pantryService.addItem({
      user_id: user!.id,
      name: values.name.trim(),
      quantity: Number(values.quantity) || 1,
      unit: values.unit.trim() || null,
      category_id: null,
      expiration_date: values.expiration_date || null,
    });
    setItems([item, ...items]);
  };

  const update = async (id: string, values: PantryFormValues) => {
    if (isDemo) {
      updateItem(id, values);
      return;
    }
    const item = await pantryService.updateItem(id, {
      name: values.name.trim(),
      quantity: Number(values.quantity) || 1,
      unit: values.unit.trim() || null,
      expiration_date: values.expiration_date || null,
    });
    setItems(items.map((i) => (i.id === id ? item : i)));
  };

  const remove = async (id: string) => {
    if (isDemo) {
      removeItem(id);
      return;
    }
    await pantryService.deleteItem(id);
    setItems(items.filter((i) => i.id !== id));
  };

  const restore = async (item: PantryItem) => {
    if (isDemo) {
      restoreItem(item);
      return;
    }
    const { id, created_at, updated_at, ...rest } = item;
    void id;
    void created_at;
    void updated_at;
    const restored = await pantryService.addItem(rest);
    setItems([restored, ...items]);
  };

  return {
    items,
    addItem: add,
    updateItem: update,
    removeItem: remove,
    restoreItem: restore,
  };
}
