import { useState, useMemo } from "react";
import { Search, Star, ShoppingCart } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLibraryStore } from "@/features/library/library.store";
import { toast } from "sonner";
import type { LibraryItem } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (item: LibraryItem, quantity: number) => Promise<void>;
}

function LibrarySheetItem({
  item,
  onAdd,
}: {
  item: LibraryItem;
  onAdd: (qty: number) => void;
}) {
  const [qty, setQty] = useState(1);

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {item.is_favorite && (
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
          )}
          <p className="truncate font-medium">{item.name}</p>
        </div>
        <div className="flex flex-wrap gap-x-1.5 text-xs text-muted-foreground">
          {item.unit && <span>{item.unit}</span>}
          {item.estimated_price != null && (
            <span>· ${item.estimated_price.toFixed(2)}</span>
          )}
          {item.store && <span>· {item.store}</span>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex items-center rounded-md border">
          <button
            className="px-2 py-1 text-sm hover:bg-muted transition-colors"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="w-6 text-center text-sm">{qty}</span>
          <button
            className="px-2 py-1 text-sm hover:bg-muted transition-colors"
            onClick={() => setQty((q) => q + 1)}
          >
            +
          </button>
        </div>
        <Button size="sm" className="h-8" onClick={() => onAdd(qty)}>
          <ShoppingCart className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function LibrarySheet({ open, onClose, onAdd }: Props) {
  const [search, setSearch] = useState("");
  const { items } = useLibraryStore();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const result = q
      ? items.filter((i) => i.name.toLowerCase().includes(q))
      : items;

    return [...result].sort((a, b) => {
      if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
      return b.times_added - a.times_added;
    });
  }, [items, search]);

  const handleAdd = async (item: LibraryItem, qty: number) => {
    await onAdd(item, qty);
    toast.success(`${item.name} added to list`);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add from Library</SheetTitle>
        </SheetHeader>

        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search library…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
            autoFocus
          />
        </div>

        <div className="mt-3 flex-1 space-y-2 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {items.length === 0
                ? "Your library is empty. Add items from the Library page."
                : "No items match your search."}
            </p>
          ) : (
            filtered.map((item) => (
              <LibrarySheetItem
                key={item.id}
                item={item}
                onAdd={(qty) => handleAdd(item, qty)}
              />
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
