import { describe, it, expect } from "vitest";
import { groceryItemSchema } from "./zod-schemas";

describe("groceryItemSchema", () => {
  it("validates a minimal valid item", () => {
    const result = groceryItemSchema.safeParse({ name: "Milk", quantity: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = groceryItemSchema.safeParse({ name: "", quantity: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects negative quantity", () => {
    const result = groceryItemSchema.safeParse({ name: "Milk", quantity: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects negative estimated price", () => {
    const result = groceryItemSchema.safeParse({
      name: "Milk",
      quantity: 1,
      estimated_price: -5,
    });
    expect(result.success).toBe(false);
  });
});
