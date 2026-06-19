import { useState } from "react";
import { Plus, Search } from "lucide-react";
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
    <div className="mx-auto max-w-2xl space-y-4 p-4">
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
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="created_at">Date Added</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <CategoryFilter categories={categories} />

      {items.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox
            id="bulk-check"
            checked={allPurchased}
            onCheckedChange={(checked) =>
              bulkMarkPurchased(
                items.map((i) => i.id),
                !!checked,
              )
            }
          />
          <label htmlFor="bulk-check" className="cursor-pointer select-none">
            {allPurchased ? "Unmark all" : "Mark all purchased"}
          </label>
        </div>
      )}

      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            {items.length === 0
              ? "Your list is empty. Add your first item!"
              : "No items match your search."}
          </p>
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
