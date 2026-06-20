import { useMemo, useState } from "react";
import { Plus, Search, Package } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { expiryStatus } from "@/features/pantry/pantry.store";
import { usePantrySync } from "@/features/pantry/hooks/use-pantry-sync";
import { PantryForm } from "@/features/pantry/components/PantryForm";
import { PantryItemRow } from "@/features/pantry/components/PantryItemRow";
import type { PantryItem } from "@/types";
import type { PantryFormValues } from "@/features/pantry/pantry.store";

type Filter = "all" | "expiring" | "expired";

export function PantryPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PantryItem | null>(null);

  const { items, addItem, updateItem, removeItem, restoreItem } =
    usePantrySync();

  const filtered = useMemo(() => {
    let r = items;
    if (filter === "expiring")
      r = r.filter((i) => expiryStatus(i.expiration_date) === "soon");
    if (filter === "expired")
      r = r.filter((i) => expiryStatus(i.expiration_date) === "expired");
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((i) => i.name.toLowerCase().includes(q));
    }
    return [...r].sort((a, b) => {
      const sa = expiryStatus(a.expiration_date);
      const sb = expiryStatus(b.expiration_date);
      const order = { expired: 0, soon: 1, ok: 2, none: 3 };
      return order[sa] - order[sb] || a.name.localeCompare(b.name);
    });
  }, [items, search, filter]);

  const expiredCount = items.filter(
    (i) => expiryStatus(i.expiration_date) === "expired",
  ).length;
  const soonCount = items.filter(
    (i) => expiryStatus(i.expiration_date) === "soon",
  ).length;

  const handleSubmit = (values: PantryFormValues) => {
    if (editing) {
      updateItem(editing.id, values);
      setEditing(null);
    } else {
      addItem(values);
    }
  };

  const openEdit = (item: PantryItem) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const FILTERS: { key: Filter; label: string; count?: number }[] = [
    { key: "all", label: "All" },
    { key: "expiring", label: "Expiring soon", count: soonCount },
    { key: "expired", label: "Expired", count: expiredCount },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 pb-24 md:pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pantry</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} item{items.length !== 1 ? "s" : ""} in stock
          </p>
        </div>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search pantry…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="flex gap-2">
        {FILTERS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              filter === key
                ? key === "expired"
                  ? "border-red-400 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                  : key === "expiring"
                    ? "border-yellow-400 bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-300"
                    : "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
            {count != null && count > 0 && (
              <span className="ml-1.5 font-semibold">({count})</span>
            )}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <Package className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-medium">Your pantry is empty</p>
            <p className="text-sm text-muted-foreground">
              Track what you have at home to avoid overbuying.
            </p>
          </div>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Add First Item
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          No items match.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <PantryItemRow
              key={item.id}
              item={item}
              onEdit={openEdit}
              onDelete={(id) => {
                const found = items.find((i) => i.id === id);
                removeItem(id);
                if (found) {
                  toast(`Removed "${found.name}"`, {
                    action: {
                      label: "Undo",
                      onClick: () => restoreItem(found),
                    },
                    duration: 4000,
                  });
                }
              }}
            />
          ))}
        </div>
      )}

      <PantryForm
        open={formOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        defaultValues={editing ?? undefined}
        title={editing ? "Edit Item" : "Add to Pantry"}
      />
    </div>
  );
}
