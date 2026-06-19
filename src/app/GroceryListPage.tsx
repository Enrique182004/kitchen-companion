import { useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
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
import { useFilteredItems } from "@/features/grocery/hooks/use-filtered-items";
import { useCategories } from "@/features/grocery/hooks/use-categories";
import { GroceryItemRow } from "@/features/grocery/components/GroceryItemRow";
import { CategoryFilter } from "@/features/grocery/components/CategoryFilter";
import { TotalsBar } from "@/features/grocery/components/TotalsBar";
import { GroceryForm } from "@/features/grocery/components/GroceryForm";
import type { GroceryItem } from "@/types";
import type { GroceryItemFormValues } from "@/lib/zod-schemas";
import type { SortBy } from "@/types";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "category", label: "Category" },
  { value: "created_at", label: "Date Added" },
];

export function GroceryListPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);

  const searchQuery = useGroceryStore((s) => s.searchQuery);
  const setSearchQuery = useGroceryStore((s) => s.setSearchQuery);
  const sortBy = useGroceryStore((s) => s.sortBy);
  const setSortBy = useGroceryStore((s) => s.setSortBy);
  const items = useGroceryStore((s) => s.items);

  const { add, update, remove, markPurchased, bulkMarkPurchased } =
    useGroceryList();
  const filteredItems = useFilteredItems();
  const { categories } = useCategories();

  const allPurchased = items.length > 0 && items.every((i) => i.purchased);
  const purchasedItems = items.filter((i) => i.purchased);

  const clearPurchased = () => {
    purchasedItems.forEach((i) => remove(i.id));
  };

  const handleAdd = async (values: GroceryItemFormValues) => {
    await add(values);
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Grocery List</h1>
        <Button onClick={() => setFormOpen(true)} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <TotalsBar />

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

      {categories.length > 0 && <CategoryFilter categories={categories} />}

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

      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <p className="text-muted-foreground">
              {items.length === 0
                ? "Your list is empty."
                : "No items match your search."}
            </p>
            {items.length === 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFormOpen(true)}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add your first item
              </Button>
            )}
          </div>
        ) : (
          filteredItems.map((item) => (
            <GroceryItemRow
              key={item.id}
              item={item}
              onToggle={(id, purchased) => markPurchased(id, purchased)}
              onEdit={openEdit}
              onDelete={remove}
            />
          ))
        )}
      </div>

      <GroceryForm
        open={formOpen}
        onClose={handleClose}
        onSubmit={editingItem ? handleEdit : handleAdd}
        defaultValues={editingItem ?? undefined}
        title={editingItem ? "Edit Item" : "Add Item"}
      />
    </div>
  );
}
