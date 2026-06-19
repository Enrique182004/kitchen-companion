import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useGroceryStore } from "../grocery.store";
import { useFilteredItems } from "./use-filtered-items";
import type { GroceryItem } from "@/types";

const makeItem = (overrides: Partial<GroceryItem> = {}): GroceryItem => ({
  id: "1",
  user_id: "u1",
  name: "Milk",
  quantity: 1,
  unit: null,
  category_id: null,
  estimated_price: null,
  actual_price: null,
  store: null,
  purchased: false,
  notes: null,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
  ...overrides,
});

describe("useFilteredItems", () => {
  beforeEach(() =>
    useGroceryStore.setState({
      items: [
        makeItem({ id: "1", name: "Milk", category_id: "cat-dairy" }),
        makeItem({ id: "2", name: "Eggs", category_id: "cat-dairy" }),
        makeItem({ id: "3", name: "Apples", category_id: "cat-produce" }),
      ],
      searchQuery: "",
      selectedCategory: null,
      sortBy: "name",
    }),
  );

  it("returns all items when no filter applied", () => {
    const { result } = renderHook(() => useFilteredItems());
    expect(result.current).toHaveLength(3);
  });

  it("filters by search query case-insensitively", () => {
    useGroceryStore.setState({ searchQuery: "egg" });
    const { result } = renderHook(() => useFilteredItems());
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe("Eggs");
  });

  it("filters by selected category", () => {
    useGroceryStore.setState({ selectedCategory: "cat-produce" });
    const { result } = renderHook(() => useFilteredItems());
    expect(result.current).toHaveLength(1);
    expect(result.current[0].name).toBe("Apples");
  });

  it("sorts by name alphabetically", () => {
    useGroceryStore.setState({ sortBy: "name" });
    const { result } = renderHook(() => useFilteredItems());
    expect(result.current.map((i) => i.name)).toEqual([
      "Apples",
      "Eggs",
      "Milk",
    ]);
  });
});
