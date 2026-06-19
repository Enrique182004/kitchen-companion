import { useMemo } from "react";
import { useGroceryStore } from "../grocery.store";

export function useFilteredItems() {
  const items = useGroceryStore((state) => state.items);
  const searchQuery = useGroceryStore((state) => state.searchQuery);
  const selectedCategory = useGroceryStore((state) => state.selectedCategory);
  const sortBy = useGroceryStore((state) => state.sortBy);

  return useMemo(() => {
    let result = items;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(q));
    }

    if (selectedCategory) {
      result = result.filter((item) => item.category_id === selectedCategory);
    }

    return [...result].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "category") {
        const catA = a.categories?.name ?? "";
        const catB = b.categories?.name ?? "";
        return catA.localeCompare(catB);
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [items, searchQuery, selectedCategory, sortBy]);
}
