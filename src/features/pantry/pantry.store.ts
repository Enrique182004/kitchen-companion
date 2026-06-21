import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PantryItem } from "@/types";

export const PANTRY_CATEGORIES = [
  "Food",
  "Drinks",
  "Cleaning",
  "Personal Care",
  "Medicine",
  "Pet",
  "Baby",
  "Other",
] as const;

export type PantryCategory = (typeof PANTRY_CATEGORIES)[number] | "";

export interface PantryFormValues {
  name: string;
  quantity: number;
  unit: string;
  expiration_date: string;
  category: string;
}

interface PantryState {
  items: PantryItem[];
  setItems: (items: PantryItem[]) => void;
  addItem: (values: PantryFormValues) => void;
  updateItem: (id: string, values: PantryFormValues) => void;
  removeItem: (id: string) => void;
  restoreItem: (item: PantryItem) => void;
}

export const usePantryStore = create<PantryState>()(
  persist(
    (set) => ({
      items: [],

      setItems: (items) => set({ items }),

      addItem: (values) =>
        set((state) => ({
          items: [
            ...state.items,
            {
              id: crypto.randomUUID(),
              user_id: "demo",
              name: values.name.trim(),
              quantity: Number(values.quantity) || 1,
              unit: values.unit.trim() || null,
              category_id: values.category || null,
              expiration_date: values.expiration_date || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        })),

      updateItem: (id, values) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  name: values.name.trim(),
                  quantity: Number(values.quantity) || 1,
                  unit: values.unit.trim() || null,
                  category_id: values.category || null,
                  expiration_date: values.expiration_date || null,
                  updated_at: new Date().toISOString(),
                }
              : i,
          ),
        })),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      restoreItem: (item) =>
        set((state) => ({
          items: state.items.some((i) => i.id === item.id)
            ? state.items
            : [...state.items, item],
        })),
    }),
    { name: "kitchen-companion-pantry" },
  ),
);

export function expiryStatus(
  date: string | null,
): "expired" | "soon" | "ok" | "none" {
  if (!date) return "none";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(date.slice(0, 10) + "T00:00:00");
  const daysLeft = Math.round((exp.getTime() - today.getTime()) / 86_400_000);
  if (daysLeft <= 0) return "expired";
  if (daysLeft <= 3) return "soon";
  return "ok";
}

export function daysUntilExpiry(date: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(date.slice(0, 10) + "T00:00:00");
  return Math.round((exp.getTime() - today.getTime()) / 86_400_000);
}
