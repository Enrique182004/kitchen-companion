import { useGroceryTotals } from "../hooks/use-grocery-totals";

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${color ?? ""}`}>{value}</p>
    </div>
  );
}

export function TotalsBar() {
  const { estimated, actual, remaining, purchasedCount, total } =
    useGroceryTotals();
  const fmt = (n: number) => `$${n.toFixed(2)}`;
  const progress = total > 0 ? Math.round((purchasedCount / total) * 100) : 0;

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Budget" value={fmt(estimated)} />
        <Stat label="Spent" value={fmt(actual)} color="text-blue-600" />
        <Stat
          label="Remaining"
          value={fmt(remaining)}
          color={
            remaining === 0 && total > 0 ? "text-green-600" : "text-orange-500"
          }
        />
        <Stat
          label="Done"
          value={`${purchasedCount} / ${total}`}
          color={
            purchasedCount === total && total > 0 ? "text-green-600" : undefined
          }
        />
      </div>
      {total > 0 && (
        <div className="space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right text-xs text-muted-foreground">
            {progress}% complete
          </p>
        </div>
      )}
    </div>
  );
}
