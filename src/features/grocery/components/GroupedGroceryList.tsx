import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { GroceryItemRow } from "./GroceryItemRow";
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
}

function ItemRow({
  item,
  handlers,
}: {
  item: GroceryItem;
  handlers: Handlers;
}) {
  return (
    <GroceryItemRow
      item={item}
      onToggle={handlers.onToggle}
      onEdit={handlers.onEdit}
      onDelete={handlers.onDelete}
      onUpdateQuantity={handlers.onUpdateQuantity}
      onSetActualPrice={handlers.onSetActualPrice}
    />
  );
}

function CategorySection({
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
        <ItemRow key={item.id} item={item} handlers={handlers} />
      ))}
    </div>
  );
}

export function GroupedGroceryList({
  activeItems,
  purchasedItems,
  selectedCategory,
  ...handlers
}: Props) {
  const [purchasedOpen, setPurchasedOpen] = useState(false);

  const grouped = useMemo(() => {
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
  }, [activeItems, selectedCategory]);

  return (
    <div className="space-y-4">
      {grouped ? (
        <>
          {grouped.sections.map(([name, items]) => (
            <CategorySection
              key={name}
              name={name}
              items={items}
              handlers={handlers}
            />
          ))}
          {grouped.uncategorized.length > 0 && (
            <CategorySection
              name="Other"
              items={grouped.uncategorized}
              handlers={handlers}
            />
          )}
        </>
      ) : (
        <div className="space-y-2">
          {activeItems.map((item) => (
            <ItemRow key={item.id} item={item} handlers={handlers} />
          ))}
        </div>
      )}

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
                <ItemRow key={item.id} item={item} handlers={handlers} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
