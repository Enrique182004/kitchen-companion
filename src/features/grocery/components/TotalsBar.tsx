import { useState } from "react";
import { Pencil, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useGroceryTotals } from "../hooks/use-grocery-totals";
import { useGroceryStore } from "../grocery.store";

function Stat({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${color ?? ""}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function TotalsBar() {
  const { estimated, actual, remaining, purchasedCount, total } =
    useGroceryTotals();
  const tripBudget = useGroceryStore((s) => s.tripBudget);
  const setTripBudget = useGroceryStore((s) => s.setTripBudget);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const fmt = (n: number) => `$${n.toFixed(2)}`;
  const progress = total > 0 ? Math.round((purchasedCount / total) * 100) : 0;

  const overBudget = tripBudget !== null && estimated > tripBudget;
  const diff = tripBudget !== null ? Math.abs(estimated - tripBudget) : 0;

  const commitBudget = () => {
    const n = parseFloat(draft);
    if (draft.trim() !== "" && (isNaN(n) || n <= 0)) {
      toast.error("Budget must be greater than $0");
    } else if (!isNaN(n) && n > 0) {
      setTripBudget(n);
    }
    setEditing(false);
    setDraft("");
  };

  return (
    <div
      className={`space-y-3 rounded-xl border p-4 shadow-sm transition-colors ${
        overBudget
          ? "border-red-400 bg-red-50/40 dark:bg-red-950/20"
          : "bg-card"
      }`}
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Budget column — user-set or estimated */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {tripBudget !== null ? "Trip Budget" : "Estimated"}
          </p>
          {editing ? (
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <span className="text-sm font-medium">$</span>
              <input
                autoFocus
                type="number"
                min="0"
                step="0.01"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitBudget();
                  if (e.key === "Escape") setEditing(false);
                }}
                onBlur={commitBudget}
                className="w-20 rounded border bg-background px-1 py-0 text-center text-base font-bold focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="0.00"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1">
              <div className="flex items-center gap-1">
                {overBudget && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                <p
                  className={`text-lg font-bold ${
                    tripBudget !== null
                      ? overBudget
                        ? "text-red-500"
                        : "text-green-600"
                      : ""
                  }`}
                >
                  {tripBudget !== null ? fmt(tripBudget) : fmt(estimated)}
                </p>
              </div>
              <button
                onClick={() => {
                  setDraft(tripBudget !== null ? String(tripBudget) : "");
                  setEditing(true);
                }}
                aria-label="Edit trip budget"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Pencil className="h-3 w-3" />
              </button>
              {tripBudget !== null && (
                <button
                  onClick={() => setTripBudget(null)}
                  aria-label="Clear trip budget"
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
          {tripBudget !== null && (
            <p
              className={`text-xs font-medium ${overBudget ? "text-red-500" : "text-green-600"}`}
            >
              {overBudget
                ? `$${diff.toFixed(2)} over`
                : `$${diff.toFixed(2)} under`}
            </p>
          )}
        </div>

        <Stat label="Spent" value={fmt(actual)} color="text-blue-600" />
        <Stat
          label="Remaining"
          value={fmt(remaining)}
          color={
            total === 0
              ? undefined
              : remaining === 0
                ? "text-green-600"
                : "text-orange-500"
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
