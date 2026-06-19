import { useGroceryStore } from "../grocery.store";

export function useGroceryTotals() {
  const items = useGroceryStore((state) => state.items);

  const estimated = items.reduce(
    (sum, item) => sum + (item.estimated_price ?? 0) * item.quantity,
    0,
  );

  const actual = items
    .filter((item) => item.purchased)
    .reduce((sum, item) => sum + (item.actual_price ?? 0), 0);

  const remaining = estimated - actual;
  const purchasedCount = items.filter((item) => item.purchased).length;

  return { estimated, actual, remaining, purchasedCount, total: items.length };
}
