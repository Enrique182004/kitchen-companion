import { useRef, useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Trash2,
  BookOpen,
  Store,
  Tag,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/auth.store";
import { pantryService } from "@/features/pantry/services/pantry.service";
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
import { useLibraryStore } from "@/features/library/library.store";
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

const isDemo = !import.meta.env.VITE_SUPABASE_URL;
const EMPTY_LIST: GroceryItem[] = [];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "category", label: "Category" },
  { value: "store", label: "Store" },
  { value: "created_at", label: "Date Added" },
];

function useLocalFilteredItems(items: GroceryItem[]) {
  const searchQuery = useGroceryStore((s) => s.searchQuery);
  const selectedCategory = useGroceryStore((s) => s.selectedCategory);
  const sortBy = useGroceryStore((s) => s.sortBy);

  return useMemo(() => {
    let result = items;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(q));
    }
    if (selectedCategory) {
      result = result.filter((item) => item.category_id === selectedCategory);
    }
    return [...result].sort((a, b) => {
      if (a.purchased !== b.purchased) return a.purchased ? 1 : -1;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "category") {
        return (a.categories?.name ?? "").localeCompare(
          b.categories?.name ?? "",
        );
      }
      if (sortBy === "store") {
        return (
          (a.store ?? "").localeCompare(b.store ?? "") ||
          a.name.localeCompare(b.name)
        );
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [items, searchQuery, selectedCategory, sortBy]);
}

function ListSwitcher() {
  const [open, setOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [creatingNew, setCreatingNew] = useState(false);
  const newListInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const lists = useGroceryStore((s) => s.lists);
  const activeListId = useGroceryStore((s) => s.activeListId);
  const createList = useGroceryStore((s) => s.createList);
  const deleteList = useGroceryStore((s) => s.deleteList);
  const setActiveList = useGroceryStore((s) => s.setActiveList);

  const activeList = lists.find((l) => l.id === activeListId);

  useEffect(() => {
    if (creatingNew) {
      newListInputRef.current?.focus();
    }
  }, [creatingNew]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setCreatingNew(false);
        setNewListName("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleCreate = () => {
    const name = newListName.trim();
    if (!name) return;
    createList(name);
    setNewListName("");
    setCreatingNew(false);
    setOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteList(id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-colors hover:bg-accent"
      >
        <span>{activeList?.name ?? "My List"}</span>
        {activeListId !== "default" && (
          <span className="text-xs text-muted-foreground">(local only)</span>
        )}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-md border bg-popover shadow-md">
          <ul className="py-1">
            {lists.map((list) => (
              <li
                key={list.id}
                className={`flex cursor-pointer items-center justify-between px-3 py-1.5 text-sm hover:bg-accent ${
                  list.id === activeListId ? "font-medium" : ""
                }`}
                onClick={() => {
                  setActiveList(list.id);
                  setOpen(false);
                }}
              >
                <span>{list.name}</span>
                {list.id !== "default" && (
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, list.id)}
                    className="ml-2 rounded p-0.5 text-muted-foreground hover:text-destructive"
                    aria-label={`Delete list "${list.name}"`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="border-t px-3 py-1.5">
            {creatingNew ? (
              <div className="flex items-center gap-1">
                <input
                  ref={newListInputRef}
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                    if (e.key === "Escape") {
                      setCreatingNew(false);
                      setNewListName("");
                    }
                  }}
                  placeholder="List name…"
                  className="flex-1 rounded border bg-background px-2 py-0.5 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!newListName.trim()}
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCreatingNew(true)}
                className="flex w-full items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                New list
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const activeListId = useGroceryStore((s) => s.activeListId);
  const defaultItems = useGroceryStore((s) => s.items);
  const localListItems = useGroceryStore(
    (s) => s.localLists[s.activeListId] ?? EMPTY_LIST,
  );
  const addLocalItem = useGroceryStore((s) => s.addLocalItem);
  const removeLocalItem = useGroceryStore((s) => s.removeLocalItem);
  const updateLocalItem = useGroceryStore((s) => s.updateLocalItem);

  const isDefault = activeListId === "default";
  const items = isDefault ? defaultItems : localListItems;

  const restoreItems = useGroceryStore((s) => s.restoreItems);
  const { add, update, remove, markPurchased, bulkMarkPurchased } =
    useGroceryList();
  const pantryItems = usePantryStore((s) => s.items);
  const pantryAddLocal = usePantryStore((s) => s.addItem);
  const pantrySetItems = usePantryStore((s) => s.setItems);
  const saveToLibrary = useLibraryStore((s) => s.saveFromForm);
  const user = useAuthStore((s) => s.user);

  // For default list: use the existing hook (reads state.items). For local lists: compute inline.
  const defaultFilteredItems = useFilteredItems();
  const localFilteredItems = useLocalFilteredItems(localListItems);
  const filteredItems = isDefault ? defaultFilteredItems : localFilteredItems;

  const { categories } = useCategories();

  const allPurchased = items.length > 0 && items.every((i) => i.purchased);
  const purchasedItems = items.filter((i) => i.purchased);
  const activeFiltered = filteredItems.filter((i) => !i.purchased);
  const purchasedFiltered = filteredItems.filter((i) => i.purchased);

  const clearPurchased = () => {
    const snapshot = [...purchasedItems];
    if (isDefault) {
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
    } else {
      snapshot.forEach((i) => removeLocalItem(activeListId, i.id));
      toast.success(
        `${snapshot.length} item${snapshot.length !== 1 ? "s" : ""} cleared`,
      );
    }
  };

  const handleToggle = (id: string, purchased: boolean) => {
    if (isDefault) {
      markPurchased(id, purchased);
    } else {
      updateLocalItem(activeListId, id, { purchased });
    }
    if (!purchased) return;
    const item = items.find((i) => i.id === id);
    if (!item) return;

    // Auto-add to pantry
    if (isDemo || !user) {
      pantryAddLocal({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit ?? "",
        expiration_date: "",
        category: "",
      });
    } else {
      pantryService
        .addItem({
          user_id: user.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit ?? null,
          category_id: null,
          expiration_date: null,
        })
        .then((newItem) => {
          pantrySetItems([newItem, ...usePantryStore.getState().items]);
        })
        .catch(() => {});
    }
    toast.success(`"${item.name}" added to pantry`);
  };

  const handleDelete = (item: GroceryItem) => {
    if (isDefault) {
      remove(item.id);
      toast(`Removed "${item.name}"`, {
        action: {
          label: "Undo",
          onClick: () => restoreItems([item]),
        },
        duration: 4000,
      });
    } else {
      removeLocalItem(activeListId, item.id);
      toast(`Removed "${item.name}"`);
    }
  };

  const handleAdd = async (values: GroceryItemFormValues) => {
    // Warn if item is already in pantry
    const inPantry = pantryItems.find(
      (p) => p.name.toLowerCase() === values.name.trim().toLowerCase(),
    );
    if (inPantry) {
      toast(`"${values.name}" is already in your pantry!`, {
        description: "You might already have this at home.",
        duration: 4000,
      });
    }

    if (isDefault) {
      await add(values); // saveToLibrary already called inside use-grocery-list
    } else {
      saveToLibrary(values);
      addLocalItem(activeListId, {
        ...values,
        id: crypto.randomUUID(),
        user_id: "local",
        actual_price: null,
        purchased: false,
        unit: values.unit ?? null,
        store: values.store ?? null,
        notes: values.notes ?? null,
        estimated_price: values.estimated_price ?? null,
        category_id: values.category_id ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  };

  const handleQuickAdd = async () => {
    const name = quickName.trim();
    if (!name) return;
    setQuickName("");
    await handleAdd({
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
    await handleAdd({
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
    if (isDefault) {
      await update(editingItem.id, values);
    } else {
      updateLocalItem(activeListId, editingItem.id, values);
    }
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
        <div className="flex flex-col gap-0.5">
          <ListSwitcher />
          <h1 className="text-2xl font-bold">Grocery List</h1>
        </div>
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

      {isDefault && <TotalsBar />}

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
              onCheckedChange={(checked) => {
                if (isDefault) {
                  bulkMarkPurchased(
                    items.map((i) => i.id),
                    !!checked,
                  );
                } else {
                  items.forEach((i) =>
                    updateLocalItem(activeListId, i.id, {
                      purchased: !!checked,
                    }),
                  );
                }
              }}
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
                await handleAdd({
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
          onUpdateQuantity={(id, quantity) => {
            if (isDefault) {
              update(id, { quantity });
            } else {
              updateLocalItem(activeListId, id, { quantity });
            }
          }}
          onSetActualPrice={(id, price) => {
            if (isDefault) {
              update(id, { actual_price: price });
            } else {
              updateLocalItem(activeListId, id, { actual_price: price });
            }
          }}
        />
      )}

      <GroceryForm
        open={formOpen}
        onClose={handleClose}
        onSubmit={editingItem ? handleEdit : handleAdd}
        defaultValues={editingItem ?? undefined}
        title={editingItem ? "Edit Item" : "Add Item"}
        categories={categories}
      />

      <LibrarySheet
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onAdd={handleAddFromLibrary}
      />
    </div>
  );
}
