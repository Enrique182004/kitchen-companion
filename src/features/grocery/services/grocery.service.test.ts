import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  mockOrder,
  mockSingle,
  mockEq,
  mockIn,
  mockDelete,
} from "@/test/mocks/supabase";
import "@/test/mocks/supabase";
import { groceryService } from "./grocery.service";
import type { GroceryItem } from "@/types";

const fakeItem: GroceryItem = {
  id: "1",
  user_id: "u1",
  name: "Milk",
  quantity: 2,
  unit: null,
  category_id: null,
  estimated_price: null,
  actual_price: null,
  store: null,
  purchased: false,
  notes: null,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
};

describe("groceryService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetchItems returns data on success", async () => {
    mockOrder.mockResolvedValueOnce({ data: [fakeItem], error: null });
    const result = await groceryService.fetchItems("u1");
    expect(result).toEqual([fakeItem]);
  });

  it("fetchItems throws on error", async () => {
    mockOrder.mockResolvedValueOnce({
      data: null,
      error: { message: "DB error" },
    });
    await expect(groceryService.fetchItems("u1")).rejects.toEqual({
      message: "DB error",
    });
  });

  it("addItem returns the new item", async () => {
    mockSingle.mockResolvedValueOnce({ data: fakeItem, error: null });
    const result = await groceryService.addItem({ ...fakeItem });
    expect(result).toEqual(fakeItem);
  });

  it("deleteItem calls delete and eq", async () => {
    mockEq.mockResolvedValueOnce({ error: null });
    await groceryService.deleteItem("1");
    expect(mockDelete).toHaveBeenCalled();
  });

  it("bulkMarkPurchased calls in with ids", async () => {
    mockIn.mockResolvedValueOnce({ error: null });
    await groceryService.bulkMarkPurchased(["1", "2"]);
    expect(mockIn).toHaveBeenCalledWith("id", ["1", "2"]);
  });
});
