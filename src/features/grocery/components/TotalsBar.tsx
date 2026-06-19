import { useGroceryTotals } from "../hooks/use-grocery-totals";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

export function TotalsBar() {
  const { estimated, actual, remaining, purchasedCount, total } =
    useGroceryTotals();
  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/40 p-4 md:grid-cols-4">
      <Stat label="Estimated" value={fmt(estimated)} />
      <Stat label="Actual" value={fmt(actual)} />
      <Stat label="Remaining" value={fmt(remaining)} />
      <Stat label="Purchased" value={`${purchasedCount} / ${total}`} />
    </div>
  );
}
