import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/auth.store";
import { usePantryStore } from "../pantry.store";
import { pantryService } from "../services/pantry.service";
import type { PantryItem } from "@/types";
import type { PantryFormValues } from "../pantry.store";

const isDemo = !import.meta.env.VITE_SUPABASE_URL;

const SEED_PANTRY: Array<{
  name: string;
  quantity: number;
  unit: string | null;
}> = [
  { name: "Sal", quantity: 1, unit: null },
  { name: "Paprika", quantity: 1, unit: null },
  { name: "Cereal", quantity: 1, unit: null },
  { name: "Sopa de espagueti", quantity: 2, unit: "sopas" },
  { name: "Sopa de fideos", quantity: 2, unit: "sopas" },
  { name: "Pepino", quantity: 1, unit: null },
  { name: "Cebolla", quantity: 1, unit: null },
  { name: "Cebolla morada", quantity: 1, unit: null },
  { name: "Limones", quantity: 10, unit: null },
  { name: "Salmón", quantity: 1, unit: null },
];

export function usePantrySync() {
  const user = useAuthStore((state) => state.user);
  const { items, setItems, addItem, updateItem, removeItem, restoreItem } =
    usePantryStore();

  useEffect(() => {
    if (isDemo || !user) return;

    const userId = user.id;

    pantryService.fetchItems(userId).then(async (fetched) => {
      if (fetched.length > 0) {
        setItems(fetched);
        return;
      }
      const saved: PantryItem[] = [];
      for (const seed of SEED_PANTRY) {
        try {
          const s = await pantryService.addItem({
            user_id: userId,
            name: seed.name,
            quantity: seed.quantity,
            unit: seed.unit,
            category_id: null,
            expiration_date: null,
          });
          saved.push(s);
        } catch (e) {
          console.error("[pantry seed] failed", seed.name, e);
        }
      }
      setItems(saved);
    });

    const handleFocus = () => {
      pantryService.fetchItems(userId).then((fetched) => {
        if (fetched.length > 0) setItems(fetched);
      });
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [user, setItems]);

  const add = async (values: PantryFormValues) => {
    if (isDemo || !user) {
      addItem(values);
      return;
    }
    const item = await pantryService.addItem({
      user_id: user.id,
      name: values.name.trim(),
      quantity: Number(values.quantity) || 1,
      unit: values.unit.trim() || null,
      category_id: values.category || null,
      expiration_date: values.expiration_date || null,
    });
    setItems([item, ...usePantryStore.getState().items]);
  };

  const update = async (id: string, values: PantryFormValues) => {
    if (isDemo || !user) {
      updateItem(id, values);
      return;
    }
    const item = await pantryService.updateItem(id, {
      name: values.name.trim(),
      quantity: Number(values.quantity) || 1,
      unit: values.unit.trim() || null,
      category_id: values.category || null,
      expiration_date: values.expiration_date || null,
    });
    setItems(
      usePantryStore.getState().items.map((i) => (i.id === id ? item : i)),
    );
  };

  const remove = async (id: string) => {
    if (isDemo || !user) {
      removeItem(id);
      return;
    }
    await pantryService.deleteItem(id);
    setItems(usePantryStore.getState().items.filter((i) => i.id !== id));
  };

  const restore = async (item: PantryItem) => {
    if (isDemo || !user) {
      restoreItem(item);
      return;
    }
    const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = item;
    const restored = await pantryService.addItem(rest);
    setItems([restored, ...usePantryStore.getState().items]);
  };

  return {
    items,
    addItem: add,
    updateItem: update,
    removeItem: remove,
    restoreItem: restore,
  };
}
