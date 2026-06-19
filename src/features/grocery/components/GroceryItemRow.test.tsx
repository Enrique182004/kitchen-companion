import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GroceryItemRow } from "./GroceryItemRow";
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
  store: "Walmart",
  purchased: false,
  notes: null,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
};

describe("GroceryItemRow", () => {
  it("renders item name and quantity with unit", () => {
    render(
      <GroceryItemRow
        item={fakeItem}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Milk")).toBeInTheDocument();
    expect(screen.getByText(/2 liters/)).toBeInTheDocument();
  });

  it("calls onToggle with id and true when checkbox clicked", async () => {
    const onToggle = vi.fn();
    render(
      <GroceryItemRow
        item={fakeItem}
        onToggle={onToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledWith("1", true);
  });

  it("applies line-through style when purchased", () => {
    render(
      <GroceryItemRow
        item={{ ...fakeItem, purchased: true }}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Milk")).toHaveClass("line-through");
  });

  it("calls onDelete when delete button clicked", async () => {
    const onDelete = vi.fn();
    render(
      <GroceryItemRow
        item={fakeItem}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    );
    await userEvent.click(screen.getByLabelText("Delete item"));
    expect(onDelete).toHaveBeenCalledWith("1");
  });

  it("calls onEdit when edit button clicked", async () => {
    const onEdit = vi.fn();
    render(
      <GroceryItemRow
        item={fakeItem}
        onToggle={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByLabelText("Edit item"));
    expect(onEdit).toHaveBeenCalledWith(fakeItem);
  });
});
