import { useState, useMemo } from "react";
import { Search, Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLibraryStore } from "@/features/library/library.store";
import { useGroceryList } from "@/features/grocery/hooks/use-grocery-list";
import type { LibraryItem } from "@/types";

type SortMode = "most_used" | "name" | "recent";

function LibraryCard({
  item,
  onAddToList,
  onDelete,
}: {
  item: LibraryItem;
  onAddToList: (item: LibraryItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{item.name}</p>
        <div className="flex flex-wrap gap-x-2 text-sm text-muted-foreground">
          {item.unit && <span>{item.unit}</span>}
          {item.estimated_price != null && (
            <span>· ${item.estimated_price.toFixed(2)}</span>
          )}
          {item.store && <span>· {item.store}</span>}
        </div>
        {item.notes && (
          <p className="mt-0.5 text-xs italic text-muted-foreground">
            {item.notes}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Added {item.times_added}× · last{" "}
          {new Date(item.last_added).toLocaleDateString()}
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <Button
          size="sm"
          onClick={() => onAddToList(item)}
          className="h-8 text-xs"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(item.id)}
          aria-label="Remove from library"
          className="h-8 w-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function LibraryPage() {
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("most_used");
  const { items, removeItem } = useLibraryStore();
  const { add } = useGroceryList();

  const filtered = useMemo(() => {
    let result = items;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q));
    }
    return [...result].sort((a, b) => {
      if (sortMode === "most_used") return b.times_added - a.times_added;
      if (sortMode === "name") return a.name.localeCompare(b.name);
      return (
        new Date(b.last_added).getTime() - new Date(a.last_added).getTime()
      );
    });
  }, [items, search, sortMode]);

  const handleAddToList = async (item: LibraryItem) => {
    await add({
      name: item.name,
      quantity: 1,
      unit: item.unit || null,
      estimated_price: item.estimated_price ?? undefined,
      store: item.store || null,
      notes: item.notes || null,
      category_id: null,
      purchased: false,
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 pb-24 md:pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Item Library</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} saved item{items.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-medium">Your library is empty</p>
            <p className="text-sm text-muted-foreground">
              Items are saved here automatically when you add them to your
              grocery list.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search library…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={sortMode}
              onValueChange={(v) => setSortMode(v as SortMode)}
            >
              <SelectTrigger className="w-36">
                <SelectValue>
                  {sortMode === "most_used"
                    ? "Most Used"
                    : sortMode === "name"
                      ? "Name"
                      : "Recent"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="most_used">Most Used</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No items match your search.
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((item) => (
                <LibraryCard
                  key={item.id}
                  item={item}
                  onAddToList={handleAddToList}
                  onDelete={removeItem}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
