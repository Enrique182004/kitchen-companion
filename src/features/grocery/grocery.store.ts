import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GroceryItem, SortBy } from "@/types";

export interface GroceryList {
  id: string;
  name: string;
}

interface GroceryState {
  items: GroceryItem[];
  tripBudget: number | null;
  searchQuery: string;
  selectedCategory: string | null;
  sortBy: SortBy;
  loading: boolean;
  // multi-list state
  lists: GroceryList[];
  activeListId: string;
  localLists: Record<string, GroceryItem[]>;

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
  // multi-list actions
  createList: (name: string) => void;
  deleteList: (id: string) => void;
  setActiveList: (id: string) => void;
  addLocalItem: (listId: string, item: GroceryItem) => void;
  removeLocalItem: (listId: string, id: string) => void;
  updateLocalItem: (
    listId: string,
    id: string,
    changes: Partial<GroceryItem>,
  ) => void;
  getActiveItems: () => GroceryItem[];
}

export const useGroceryStore = create<GroceryState>()(
  persist(
    (set, get): GroceryState => ({
      items: [],
      tripBudget: null,
      searchQuery: "",
      selectedCategory: null,
      sortBy: "name",
      loading: false,
      lists: [{ id: "default", name: "My List" }],
      activeListId: "default",
      localLists: {},
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
      createList: (name) =>
        set((state) => ({
          lists: [...state.lists, { id: crypto.randomUUID(), name }],
        })),
      deleteList: (id) => {
        if (id === "default") return;
        set((state) => {
          const { [id]: _removed, ...remainingLocalLists } = state.localLists;
          return {
            lists: state.lists.filter((l) => l.id !== id),
            localLists: remainingLocalLists,
            activeListId:
              state.activeListId === id ? "default" : state.activeListId,
          };
        });
      },
      setActiveList: (id) => set({ activeListId: id }),
      addLocalItem: (listId, item) =>
        set((state) => ({
          localLists: {
            ...state.localLists,
            [listId]: [...(state.localLists[listId] ?? []), item],
          },
        })),
      removeLocalItem: (listId, id) =>
        set((state) => ({
          localLists: {
            ...state.localLists,
            [listId]: (state.localLists[listId] ?? []).filter(
              (i) => i.id !== id,
            ),
          },
        })),
      updateLocalItem: (listId, id, changes) =>
        set((state) => ({
          localLists: {
            ...state.localLists,
            [listId]: (state.localLists[listId] ?? []).map((i) =>
              i.id === id ? { ...i, ...changes } : i,
            ),
          },
        })),
      getActiveItems: () => {
        const { activeListId, items, localLists } = get();
        return activeListId === "default"
          ? items
          : (localLists[activeListId] ?? []);
      },
    }),
    {
      name: "kitchen-companion-grocery",
      partialize: (state) => ({
        items: state.items,
        tripBudget: state.tripBudget,
        lists: state.lists,
        activeListId: state.activeListId,
        localLists: state.localLists,
      }),
    },
  ),
);
