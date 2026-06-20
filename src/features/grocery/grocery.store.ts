import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GroceryItem, SortBy } from "@/types";

interface GroceryState {
  items: GroceryItem[];
  tripBudget: number | null;
  searchQuery: string;
  selectedCategory: string | null;
  sortBy: SortBy;
  loading: boolean;
  setItems: (items: GroceryItem[]) => void;
  addItem: (item: GroceryItem) => void;
  restoreItems: (items: GroceryItem[]) => void;
  updateItem: (id: string, changes: Partial<GroceryItem>) => void;
  removeItem: (id: string) => void;
  reorderItems: (orderedIds: string[]) => void;
  getRecurring: () => GroceryItem[];
  setTripBudget: (budget: number | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setSortBy: (sortBy: SortBy) => void;
  setLoading: (loading: boolean) => void;
}

export const useGroceryStore = create<GroceryState>()(
  persist(
    (set): GroceryState => ({
      items: [],
      tripBudget: null,
      searchQuery: "",
      selectedCategory: null,
      sortBy: "name",
      loading: false,
      setItems: (items) => set({ items }),
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      restoreItems: (restored) =>
        set((state) => {
          const existingIds = new Set(state.items.map((i) => i.id));
          return {
            items: [
              ...state.items,
              ...restored.filter((i) => !existingIds.has(i.id)),
            ],
          };
        }),
      updateItem: (id, changes) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...changes } : item,
          ),
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      reorderItems: (orderedIds) =>
        set((state) => {
          const map = new Map(state.items.map((i) => [i.id, i]));
          const reordered = orderedIds
            .map((id) => map.get(id))
            .filter(Boolean) as GroceryItem[];
          const rest = state.items.filter((i) => !orderedIds.includes(i.id));
          return { items: [...reordered, ...rest] };
        }),
      getRecurring: () =>
        useGroceryStore.getState().items.filter((i) => i.recurring),
      setTripBudget: (tripBudget) => set({ tripBudget }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setSortBy: (sortBy) => set({ sortBy }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: "kitchen-companion-grocery",
      partialize: (state) => ({
        items: state.items,
        tripBudget: state.tripBudget,
      }),
    },
  ),
);
