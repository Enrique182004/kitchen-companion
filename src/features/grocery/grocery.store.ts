import { create } from "zustand";
import type { GroceryItem, SortBy } from "@/types";

interface GroceryState {
  items: GroceryItem[];
  searchQuery: string;
  selectedCategory: string | null;
  sortBy: SortBy;
  loading: boolean;
  setItems: (items: GroceryItem[]) => void;
  addItem: (item: GroceryItem) => void;
  updateItem: (id: string, changes: Partial<GroceryItem>) => void;
  removeItem: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setSortBy: (sortBy: SortBy) => void;
  setLoading: (loading: boolean) => void;
}

export const useGroceryStore = create<GroceryState>((set) => ({
  items: [],
  searchQuery: "",
  selectedCategory: null,
  sortBy: "name",
  loading: false,
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  updateItem: (id, changes) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...changes } : item,
      ),
    })),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSortBy: (sortBy) => set({ sortBy }),
  setLoading: (loading) => set({ loading }),
}));
