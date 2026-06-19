import { describe, it, expect, beforeEach } from "vitest";
import { useGroceryStore } from "./grocery.store";
import type { GroceryItem } from "@/types";

const fakeItem: GroceryItem = {
  id: "1",
  user_id: "u1",
  name: "Milk",
  quantity: 2,
  unit: "liters",
  category_id: null,
  estimated_price: 3.99,
  actual_price: null,
  store: null,
  purchased: false,
  notes: null,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
};

describe("useGroceryStore", () => {
  beforeEach(() => {
    useGroceryStore.setState({
      items: [],
      searchQuery: "",
      selectedCategory: null,
      sortBy: "created_at",
      loading: false,
    });
  });

  it("addItem appends to items", () => {
    useGroceryStore.getState().addItem(fakeItem);
    expect(useGroceryStore.getState().items).toHaveLength(1);
    expect(useGroceryStore.getState().items[0].name).toBe("Milk");
  });

  it("updateItem patches the matching item", () => {
    useGroceryStore.setState({ items: [fakeItem] });
    useGroceryStore.getState().updateItem("1", { purchased: true });
    expect(useGroceryStore.getState().items[0].purchased).toBe(true);
  });

  it("removeItem removes the matching item", () => {
    useGroceryStore.setState({ items: [fakeItem] });
    useGroceryStore.getState().removeItem("1");
    expect(useGroceryStore.getState().items).toHaveLength(0);
  });

  it("setSearchQuery updates searchQuery", () => {
    useGroceryStore.getState().setSearchQuery("cheese");
    expect(useGroceryStore.getState().searchQuery).toBe("cheese");
  });

  it("setSelectedCategory updates selectedCategory", () => {
    useGroceryStore.getState().setSelectedCategory("cat-dairy");
    expect(useGroceryStore.getState().selectedCategory).toBe("cat-dairy");
  });
});
