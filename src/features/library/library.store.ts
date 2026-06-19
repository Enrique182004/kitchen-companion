import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LibraryItem } from "@/types";
import type { GroceryItemFormValues } from "@/lib/zod-schemas";

export interface LibraryItemFields {
  name: string;
  unit?: string;
  estimated_price?: number | null;
  store?: string | null;
  notes?: string | null;
}

interface LibraryState {
  items: LibraryItem[];
  saveFromForm: (values: GroceryItemFormValues) => void;
  createItem: (fields: LibraryItemFields) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, changes: Partial<LibraryItem>) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      items: [],

      saveFromForm: (values) => {
        const existing = get().items.find(
          (i) => i.name.toLowerCase() === values.name.toLowerCase(),
        );

        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === existing.id
                ? {
                    ...i,
                    unit: values.unit ?? i.unit,
                    estimated_price:
                      values.estimated_price ?? i.estimated_price,
                    store: values.store ?? i.store,
                    notes: values.notes ?? i.notes,
                    times_added: i.times_added + 1,
                    last_added: new Date().toISOString(),
                  }
                : i,
            ),
          }));
        } else {
          const newItem: LibraryItem = {
            id: crypto.randomUUID(),
            name: values.name,
            unit: values.unit ?? "",
            estimated_price: values.estimated_price ?? null,
            store: values.store ?? null,
            notes: values.notes ?? null,
            times_added: 1,
            last_added: new Date().toISOString(),
          };
          set((state) => ({ items: [...state.items, newItem] }));
        }
      },

      createItem: (fields) => {
        const existing = get().items.find(
          (i) => i.name.toLowerCase() === fields.name.toLowerCase(),
        );
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === existing.id ? { ...i, ...fields } : i,
            ),
          }));
        } else {
          set((state) => ({
            items: [
              ...state.items,
              {
                id: crypto.randomUUID(),
                name: fields.name,
                unit: fields.unit ?? "",
                estimated_price: fields.estimated_price ?? null,
                store: fields.store ?? null,
                notes: fields.notes ?? null,
                times_added: 0,
                last_added: new Date().toISOString(),
              },
            ],
          }));
        }
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateItem: (id, changes) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, ...changes } : i,
          ),
        })),
    }),
    { name: "kitchen-companion-library" },
  ),
);
