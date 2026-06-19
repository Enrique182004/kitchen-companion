import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useGroceryStore } from "../grocery.store";
import { useGroceryTotals } from "./use-grocery-totals";
import type { GroceryItem } from "@/types";

const makeItem = (overrides: Partial<GroceryItem> = {}): GroceryItem => ({
  id: "1",
  user_id: "u1",
  name: "Item",
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

describe("useGroceryTotals", () => {
  beforeEach(() => useGroceryStore.setState({ items: [] }));

  it("returns zeros when no items", () => {
    const { result } = renderHook(() => useGroceryTotals());
    expect(result.current.estimated).toBe(0);
    expect(result.current.actual).toBe(0);
    expect(result.current.remaining).toBe(0);
    expect(result.current.purchasedCount).toBe(0);
  });

  it("calculates estimated as sum of price × quantity", () => {
    useGroceryStore.setState({
      items: [
        makeItem({ id: "1", estimated_price: 2.0, quantity: 3 }),
        makeItem({ id: "2", estimated_price: 1.5, quantity: 2 }),
      ],
    });
    const { result } = renderHook(() => useGroceryTotals());
    expect(result.current.estimated).toBeCloseTo(9.0);
  });

  it("calculates actual from purchased items only", () => {
    useGroceryStore.setState({
      items: [
        makeItem({ id: "1", purchased: true, actual_price: 3.5 }),
        makeItem({ id: "2", purchased: false, actual_price: 2.0 }),
      ],
    });
    const { result } = renderHook(() => useGroceryTotals());
    expect(result.current.actual).toBeCloseTo(3.5);
  });

  it("counts purchased items", () => {
    useGroceryStore.setState({
      items: [
        makeItem({ id: "1", purchased: true }),
        makeItem({ id: "2", purchased: true }),
        makeItem({ id: "3", purchased: false }),
      ],
    });
    const { result } = renderHook(() => useGroceryTotals());
    expect(result.current.purchasedCount).toBe(2);
    expect(result.current.total).toBe(3);
  });
});
