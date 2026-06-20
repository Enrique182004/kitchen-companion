import { useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Trash2, BookOpen, Store, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useGroceryStore } from "@/features/grocery/grocery.store";
import { useGroceryList } from "@/features/grocery/hooks/use-grocery-list";
import { usePantryStore } from "@/features/pantry/pantry.store";
import { useFilteredItems } from "@/features/grocery/hooks/use-filtered-items";
import { useCategories } from "@/features/grocery/hooks/use-categories";
import { CategoryFilter } from "@/features/grocery/components/CategoryFilter";
import { TotalsBar } from "@/features/grocery/components/TotalsBar";
import { GroceryForm } from "@/features/grocery/components/GroceryForm";
import { GroupedGroceryList } from "@/features/grocery/components/GroupedGroceryList";
import { LibrarySheet } from "@/features/library/components/LibrarySheet";
import type { GroceryItem, LibraryItem } from "@/types";
import type { GroceryItemFormValues } from "@/lib/zod-schemas";
import type { SortBy } from "@/types";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "category", label: "Category" },
  { value: "store", label: "Store" },
  { value: "created_at", label: "Date Added" },
];

export function GroceryListPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [quickName, setQuickName] = useState("");
  const [groupBy, setGroupBy] = useState<"category" | "store">("category");
  const quickInputRef = useRef<HTMLInputElement>(null);

  const searchQuery = useGroceryStore((s) => s.searchQuery);
  const setSearchQuery = useGroceryStore((s) => s.setSearchQuery);
  const sortBy = useGroceryStore((s) => s.sortBy);
  const setSortBy = useGroceryStore((s) => s.setSortBy);
  const selectedCategory = useGroceryStore((s) => s.selectedCategory);
  const items = useGroceryStore((s) => s.items);

  const restoreItems = useGroceryStore((s) => s.restoreItems);
  const { add, update, remove, markPurchased, bulkMarkPurchased } =
    useGroceryList();
  const addToPantry = usePantryStore((s) => s.addItem);
  const filteredItems = useFilteredItems();
  const { categories } = useCategories();

  const allPurchased = items.length > 0 && items.every((i) => i.purchased);
  const purchasedItems = items.filter((i) => i.purchased);
  const activeFiltered = filteredItems.filter((i) => !i.purchased);
  const purchasedFiltered = filteredItems.filter((i) => i.purchased);

  const clearPurchased = () => {
    const snapshot = [...purchasedItems];
    snapshot.forEach((i) => remove(i.id));
    toast.success(
      `${snapshot.length} item${snapshot.length !== 1 ? "s" : ""} cleared`,
      {
        action: {
          label: "Undo",
          onClick: () => restoreItems(snapshot),
        },
        duration: 5000,
      },
    );
  };

  const handleToggle = (id: string, purchased: boolean) => {
    markPurchased(id, purchased);
    if (purchased) {
      const item = items.find((i) => i.id === id);
      if (item) {
        toast(`"${item.name}" marked as purchased`, {
          action: {
            label: "Add to pantry",
            onClick: () =>
              addToPantry({
                name: item.name,
                quantity: item.quantity,
                unit: item.unit ?? "",
                expiration_date: "",
              }),
          },
          duration: 5000,
        });
      }
    }
  };

  const handleDelete = (item: GroceryItem) => {
    remove(item.id);
    toast(`Removed "${item.name}"`, {
      action: {
        label: "Undo",
        onClick: () => restoreItems([item]),
      },
      duration: 4000,
    });
  };

  const handleAdd = async (values: GroceryItemFormValues) => {
    await add(values);
  };

  const handleQuickAdd = async () => {
    const name = quickName.trim();
    if (!name) return;
    setQuickName("");
    await add({
      name,
      quantity: 1,
      unit: undefined,
      estimated_price: undefined,
      store: undefined,
      notes: undefined,
      category_id: null,
      purchased: false,
    });
    quickInputRef.current?.focus();
  };

  const handleAddFromLibrary = async (item: LibraryItem, quantity: number) => {
    await add({
      name: item.name,
      quantity,
      unit: item.unit || undefined,
      estimated_price: item.estimated_price ?? undefined,
      store: item.store || undefined,
      notes: item.notes || undefined,
      category_id: null,
      purchased: false,
    });
  };

  const handleEdit = async (values: GroceryItemFormValues) => {
    if (!editingItem) return;
    await update(editingItem.id, values);
    setEditingItem(null);
  };

  const openEdit = (item: GroceryItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 pb-24 md:pb-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Grocery List</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLibraryOpen(true)}
          >
            <BookOpen className="mr-1 h-4 w-4" />
            Library
          </Button>
          <Button onClick={() => setFormOpen(true)} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      <TotalsBar />

      <div className="flex gap-2">
        <Input
          ref={quickInputRef}
          placeholder="Quick add — type a name and press Enter…"
          value={quickName}
          onChange={(e) => setQuickName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleQuickAdd();
          }}
          className="flex-1"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleQuickAdd}
          disabled={!quickName.trim()}
          aria-label="Quick add item"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
          <SelectTrigger className="w-36">
            <SelectValue>
              {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        {categories.length > 0 && <CategoryFilter categories={categories} />}
        <button
          type="button"
          onClick={() =>
            setGroupBy((v) => (v === "category" ? "store" : "category"))
          }
          className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title={
            groupBy === "category" ? "Group by store" : "Group by category"
          }
        >
          {groupBy === "category" ? (
            <>
              <Store className="h-3.5 w-3.5" />
              By store
            </>
          ) : (
            <>
              <Tag className="h-3.5 w-3.5" />
              By category
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-between min-h-[2rem]">
        {items.length > 0 && (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground select-none">
            <Checkbox
              checked={allPurchased}
              onCheckedChange={(checked) =>
                bulkMarkPurchased(
                  items.map((i) => i.id),
                  !!checked,
                )
              }
            />
            {allPurchased ? "Unmark all" : "Mark all purchased"}
          </label>
        )}
        {purchasedItems.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearPurchased}
            className="ml-auto text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Clear {purchasedItems.length} purchased
          </Button>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-muted-foreground">
            {items.length === 0
              ? "Your list is empty."
              : searchQuery && selectedCategory
                ? `No items match "${searchQuery}" in this category.`
                : searchQuery
                  ? `No items match "${searchQuery}".`
                  : "No items in this category."}
          </p>
          {items.length === 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFormOpen(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add your first item
            </Button>
          ) : searchQuery ? (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await add({
                  name: searchQuery,
                  quantity: 1,
                  unit: undefined,
                  estimated_price: undefined,
                  store: undefined,
                  notes: undefined,
                  category_id: null,
                  purchased: false,
                });
                setSearchQuery("");
              }}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add "{searchQuery}" to list
            </Button>
          ) : null}
        </div>
      ) : (
        <GroupedGroceryList
          activeItems={activeFiltered}
          purchasedItems={purchasedFiltered}
          selectedCategory={selectedCategory}
          groupBy={groupBy}
          onToggle={handleToggle}
          onEdit={openEdit}
          onDelete={(id) => {
            const item = items.find((i) => i.id === id);
            if (item) handleDelete(item);
          }}
          onUpdateQuantity={(id, quantity) => update(id, { quantity })}
          onSetActualPrice={(id, price) => update(id, { actual_price: price })}
        />
      )}

      <GroceryForm
        open={formOpen}
        onClose={handleClose}
        onSubmit={editingItem ? handleEdit : handleAdd}
        defaultValues={editingItem ?? undefined}
        title={editingItem ? "Edit Item" : "Add Item"}
      />

      <LibrarySheet
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onAdd={handleAddFromLibrary}
      />
    </div>
  );
}
