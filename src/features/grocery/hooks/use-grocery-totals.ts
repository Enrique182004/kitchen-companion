import { useGroceryStore } from "../grocery.store";

export function useGroceryTotals() {
  const items = useGroceryStore((state) => state.items);

  const purchased = items.filter((i) => i.purchased);
  const unpurchased = items.filter((i) => !i.purchased);

  const estimated = items.reduce(
    (sum, item) => sum + (item.estimated_price ?? 0) * item.quantity,
    0,
  );

  const actual = purchased.reduce(
    (sum, item) =>
      sum + (item.actual_price ?? item.estimated_price ?? 0) * item.quantity,
    0,
  );

  const remaining = unpurchased.reduce(
    (sum, item) => sum + (item.estimated_price ?? 0) * item.quantity,
    0,
  );

  return {
    estimated,
    actual,
    remaining,
    purchasedCount: purchased.length,
    total: items.length,
  };
}
