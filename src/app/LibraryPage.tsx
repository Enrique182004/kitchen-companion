import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  ShoppingCart,
  Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LibraryForm } from "@/features/library/components/LibraryForm";
import { useLibrarySync } from "@/features/library/hooks/use-library-sync";
import { useGroceryList } from "@/features/grocery/hooks/use-grocery-list";
import { toast } from "sonner";
import type { LibraryItem } from "@/types";

type SortMode = "most_used" | "name" | "recent";

function LibraryCard({
  item,
  onAddToList,
  onEdit,
  onDelete,
  onToggleFavorite,
}: {
  item: LibraryItem;
  onAddToList: (item: LibraryItem) => void;
  onEdit: (item: LibraryItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-card p-3 shadow-sm">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleFavorite(item.id)}
            aria-label={item.is_favorite ? "Unstar item" : "Star item"}
            className="shrink-0 p-0.5 text-muted-foreground transition-colors hover:text-yellow-400"
          >
            <Star
              className={`h-3.5 w-3.5 ${item.is_favorite ? "fill-yellow-400 text-yellow-400" : ""}`}
            />
          </button>
          <p className="font-medium">{item.name}</p>
        </div>
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
          {item.times_added > 0
            ? `Added ${item.times_added}× · last ${new Date(item.last_added).toLocaleDateString()}`
            : "Not yet added to list"}
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <Button
          size="sm"
          onClick={() => onAddToList(item)}
          className="h-8 text-xs"
          title="Add to grocery list"
        >
          <ShoppingCart className="mr-1 h-3.5 w-3.5" />
          Add
        </Button>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(item)}
            aria-label="Edit item"
            className="h-8 w-8"
          >
            <Pencil className="h-3.5 w-3.5" />
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
    </div>
  );
}

export function LibraryPage() {
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("most_used");
  const [favOnly, setFavOnly] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);

  const {
    items,
    createItem,
    updateItem,
    removeItem,
    restoreItem,
    toggleFavorite,
  } = useLibrarySync();

  const handleDelete = (id: string) => {
    const item = items.find((i) => i.id === id);
    removeItem(id);
    if (item) {
      toast(`Removed "${item.name}"`, {
        action: { label: "Undo", onClick: () => restoreItem(item) },
        duration: 4000,
      });
    }
  };
  const { add } = useGroceryList();

  const filtered = useMemo(() => {
    let result = items;
    if (favOnly) result = result.filter((i) => i.is_favorite);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q));
    }
    return [...result].sort((a, b) => {
      if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
      if (sortMode === "most_used") return b.times_added - a.times_added;
      if (sortMode === "name") return a.name.localeCompare(b.name);
      return (
        new Date(b.last_added).getTime() - new Date(a.last_added).getTime()
      );
    });
  }, [items, search, sortMode, favOnly]);

  const handleAddToList = async (item: LibraryItem) => {
    await add({
      name: item.name,
      quantity: 1,
      unit: item.unit || undefined,
      estimated_price: item.estimated_price ?? undefined,
      store: item.store || undefined,
      notes: item.notes || undefined,
      category_id: null,
      purchased: false,
    });
    toast.success(`${item.name} added to grocery list`);
  };

  const handleCreate = (values: {
    name: string;
    unit?: string;
    estimated_price?: number | "" | null;
    store?: string;
    notes?: string;
  }) => {
    createItem({
      name: values.name,
      unit: values.unit || undefined,
      estimated_price:
        values.estimated_price !== "" && values.estimated_price != null
          ? Number(values.estimated_price)
          : null,
      store: values.store || null,
      notes: values.notes || null,
    });
  };

  const handleEdit = (values: {
    name: string;
    unit?: string;
    estimated_price?: number | "" | null;
    store?: string;
    notes?: string;
  }) => {
    if (!editingItem) return;
    updateItem(editingItem.id, {
      name: values.name,
      unit: values.unit ?? "",
      estimated_price:
        values.estimated_price !== "" && values.estimated_price != null
          ? Number(values.estimated_price)
          : null,
      store: values.store || null,
      notes: values.notes || null,
    });
    setEditingItem(null);
  };

  const openEdit = (item: LibraryItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditingItem(null);
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
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          New Item
        </Button>
      </div>

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

      {items.length > 0 && (
        <button
          onClick={() => setFavOnly((v) => !v)}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors ${
            favOnly
              ? "border-yellow-400 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <Star
            className={`h-3.5 w-3.5 ${favOnly ? "fill-yellow-400 text-yellow-400" : ""}`}
          />
          Favorites
          {favOnly && (
            <span className="ml-0.5 font-medium">
              ({items.filter((i) => i.is_favorite).length})
            </span>
          )}
        </button>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-medium">Your library is empty</p>
            <p className="text-sm text-muted-foreground">
              Create items here or they save automatically from your grocery
              list.
            </p>
          </div>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Create First Item
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          {favOnly ? "No favorite items yet." : "No items match your search."}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <LibraryCard
              key={item.id}
              item={item}
              onAddToList={handleAddToList}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}

      <LibraryForm
        open={formOpen}
        onClose={handleClose}
        onSubmit={editingItem ? handleEdit : handleCreate}
        defaultValues={editingItem ?? undefined}
        title={editingItem ? "Edit Item" : "New Library Item"}
      />
    </div>
  );
}
