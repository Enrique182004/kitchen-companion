import { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SortableGroceryItem } from "./SortableGroceryItem";
import { GroceryItemRow } from "./GroceryItemRow";
import { useGroceryStore } from "@/features/grocery/grocery.store";
import type { GroceryItem } from "@/types";

interface Handlers {
  onToggle: (id: string, purchased: boolean) => void;
  onEdit: (item: GroceryItem) => void;
  onDelete: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onSetActualPrice: (id: string, price: number | null) => void;
}

interface Props extends Handlers {
  activeItems: GroceryItem[];
  purchasedItems: GroceryItem[];
  selectedCategory: string | null;
  groupBy?: "category" | "store";
}

function Section({
  name,
  items,
  handlers,
}: {
  name: string;
  items: GroceryItem[];
  handlers: Handlers;
}) {
  return (
    <div className="space-y-2">
      <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {name}
      </p>
      {items.map((item) => (
        <SortableGroceryItem key={item.id} item={item} {...handlers} />
      ))}
    </div>
  );
}

export function GroupedGroceryList({
  activeItems,
  purchasedItems,
  selectedCategory,
  groupBy = "category",
  ...handlers
}: Props) {
  const [purchasedOpen, setPurchasedOpen] = useState(false);
  const reorderItems = useGroceryStore((s) => s.reorderItems);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeIds = useMemo(() => activeItems.map((i) => i.id), [activeItems]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = activeItems.findIndex((i) => i.id === active.id);
    const newIndex = activeItems.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(activeItems, oldIndex, newIndex);
    reorderItems(reordered.map((i) => i.id));
  };

  const grouped = useMemo(() => {
    if (groupBy === "store") {
      const map = new Map<string, GroceryItem[]>();
      const noStore: GroceryItem[] = [];
      for (const item of activeItems) {
        const key = item.store?.trim();
        if (key) {
          if (!map.has(key)) map.set(key, []);
          map.get(key)!.push(item);
        } else {
          noStore.push(item);
        }
      }
      const sections = [...map.entries()].sort(([a], [b]) =>
        a.localeCompare(b),
      );
      return { sections, uncategorized: noStore };
    }

    const hasCats = activeItems.some((i) => i.categories);
    if (!hasCats || selectedCategory) return null;

    const map = new Map<string, GroceryItem[]>();
    const uncategorized: GroceryItem[] = [];
    for (const item of activeItems) {
      if (item.categories) {
        const name = item.categories.name;
        if (!map.has(name)) map.set(name, []);
        map.get(name)!.push(item);
      } else {
        uncategorized.push(item);
      }
    }
    const sections = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
    return { sections, uncategorized };
  }, [activeItems, selectedCategory, groupBy]);

  const fallbackLabel = groupBy === "store" ? "No store specified" : "Other";

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={activeIds}
          strategy={verticalListSortingStrategy}
        >
          {grouped ? (
            <>
              {grouped.sections.map(([name, items]) => (
                <Section
                  key={name}
                  name={name}
                  items={items}
                  handlers={handlers}
                />
              ))}
              {grouped.uncategorized.length > 0 && (
                <Section
                  name={fallbackLabel}
                  items={grouped.uncategorized}
                  handlers={handlers}
                />
              )}
            </>
          ) : (
            <div className="space-y-2">
              {activeItems.map((item) => (
                <SortableGroceryItem key={item.id} item={item} {...handlers} />
              ))}
            </div>
          )}
        </SortableContext>
      </DndContext>

      {purchasedItems.length > 0 && (
        <div className="border-t pt-2">
          <button
            onClick={() => setPurchasedOpen((v) => !v)}
            className="flex w-full items-center gap-2 rounded-lg px-1 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {purchasedOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            {purchasedItems.length} purchased
          </button>
          {purchasedOpen && (
            <div className="space-y-2 pt-1">
              {purchasedItems.map((item) => (
                <GroceryItemRow key={item.id} item={item} {...handlers} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
