import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useGroceryStore } from "@/features/grocery/grocery.store";
import { useGroceryTotals } from "@/features/grocery/hooks/use-grocery-totals";
import { usePantryStore, expiryStatus } from "@/features/pantry/pantry.store";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className={`rounded-lg p-2 ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const items = useGroceryStore((s) => s.items);
  const { estimated, actual, remaining, purchasedCount, total } =
    useGroceryTotals();

  const unpurchased = total - purchasedCount;
  const progress = total > 0 ? Math.round((purchasedCount / total) * 100) : 0;
  const fmt = (n: number) => `$${n.toFixed(2)}`;

  const storeBreakdown = useMemo(
    () =>
      items.reduce<Record<string, number>>((acc, item) => {
        if (!item.store) return acc;
        acc[item.store] = (acc[item.store] ?? 0) + 1;
        return acc;
      }, {}),
    [items],
  );

  const topStores = useMemo(
    () =>
      Object.entries(storeBreakdown)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4),
    [storeBreakdown],
  );

  const pantryItems = usePantryStore((s) => s.items);
  const pantryExpired = pantryItems.filter(
    (i) => expiryStatus(i.expiration_date) === "expired",
  ).length;
  const pantrySoon = pantryItems.filter(
    (i) => expiryStatus(i.expiration_date) === "soon",
  ).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 pb-24 md:pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Your kitchen at a glance
          </p>
        </div>
        <Link to="/grocery" className={buttonVariants({ size: "sm" })}>
          View List
        </Link>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-16 text-center">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-medium">Your list is empty</p>
            <p className="text-sm text-muted-foreground">
              Add some items to get started
            </p>
          </div>
          <Link to="/grocery" className={buttonVariants()}>
            Go to Grocery List
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={ShoppingCart}
              label="Items left"
              value={String(unpurchased)}
              sub={`${purchasedCount} done`}
              color="bg-blue-500"
            />
            <StatCard
              icon={CheckCircle2}
              label="Progress"
              value={`${progress}%`}
              sub={`${purchasedCount} of ${total} items`}
              color="bg-green-500"
            />
            <StatCard
              icon={DollarSign}
              label="Budget"
              value={fmt(estimated)}
              sub={`${fmt(actual)} spent`}
              color="bg-purple-500"
            />
            <StatCard
              icon={TrendingUp}
              label="Remaining"
              value={fmt(remaining)}
              sub="still to spend"
              color="bg-orange-500"
            />
          </div>

          {total > 0 && (
            <div className="rounded-xl border bg-card p-4 shadow-sm space-y-2">
              <p className="text-sm font-medium">Shopping progress</p>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{purchasedCount} purchased</span>
                <span>{unpurchased} remaining</span>
              </div>
            </div>
          )}

          {topStores.length > 0 && (
            <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
              <p className="text-sm font-medium">Stores this trip</p>
              <div className="space-y-2">
                {topStores.map(([store, count]) => (
                  <div
                    key={store}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{store}</span>
                    <span className="text-sm text-muted-foreground">
                      {count} item{count !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {unpurchased > 0 && (
            <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
              <p className="text-sm font-medium">Still needed</p>
              <div className="space-y-1">
                {items
                  .filter((i) => !i.purchased)
                  .slice(0, 5)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{item.name}</span>
                      <span className="text-muted-foreground">
                        {item.quantity}
                        {item.unit ? ` ${item.unit}` : ""}
                      </span>
                    </div>
                  ))}
                {unpurchased > 5 && (
                  <p className="pt-1 text-xs text-muted-foreground">
                    +{unpurchased - 5} more…{" "}
                    <Link to="/grocery" className="underline">
                      view all
                    </Link>
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {pantryItems.length > 0 && (
        <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Pantry status</p>
            <Link
              to="/pantry"
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              View pantry
            </Link>
          </div>
          <div className="flex gap-4">
            {pantryExpired > 0 ? (
              <Link
                to="/pantry"
                className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950/30"
              >
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {pantryExpired} expired
                  </p>
                  <p className="text-xs text-red-500/70">needs attention</p>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 dark:bg-green-950/30">
                <Package className="h-4 w-4 text-green-500 shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-400">
                  Nothing expired
                </p>
              </div>
            )}
            {pantrySoon > 0 && (
              <Link
                to="/pantry"
                className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 dark:bg-orange-950/30"
              >
                <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                    {pantrySoon} expiring soon
                  </p>
                  <p className="text-xs text-orange-500/70">use soon</p>
                </div>
              </Link>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {pantryItems.length} item{pantryItems.length !== 1 ? "s" : ""} in
            pantry
          </p>
        </div>
      )}
    </div>
  );
}
