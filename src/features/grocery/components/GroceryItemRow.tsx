import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { GroceryItem } from "@/types";

interface Props {
  item: GroceryItem;
  onToggle: (id: string, purchased: boolean) => void;
  onEdit: (item: GroceryItem) => void;
  onDelete: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onSetActualPrice: (id: string, price: number | null) => void;
}

export function GroceryItemRow({
  item,
  onToggle,
  onEdit,
  onDelete,
  onUpdateQuantity,
  onSetActualPrice,
}: Props) {
  const [priceInput, setPriceInput] = useState(
    item.actual_price != null ? String(item.actual_price) : "",
  );
  const priceRef = useRef<HTMLInputElement>(null);

  // Sync local price input when item.actual_price changes externally (e.g. undo restore)
  useEffect(() => {
    setPriceInput(item.actual_price != null ? String(item.actual_price) : "");
  }, [item.actual_price]);
  const dimmed = item.purchased ? "opacity-60" : "";

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border bg-card p-3 shadow-sm transition-opacity ${dimmed}`}
    >
      <Checkbox
        checked={item.purchased}
        onCheckedChange={(checked) => {
          onToggle(item.id, !!checked);
          if (checked) setTimeout(() => priceRef.current?.focus(), 50);
        }}
        aria-label={`Mark ${item.name} as purchased`}
        className="mt-0.5 shrink-0"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`font-medium ${item.purchased ? "text-muted-foreground line-through" : ""}`}
          >
            {item.name}
          </span>
          {item.categories && (
            <Badge variant="secondary" className="text-xs">
              {item.categories.name}
            </Badge>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {/* quantity stepper */}
          <div className="flex items-center rounded-md border">
            <button
              className="px-1.5 py-0.5 text-xs hover:bg-muted transition-colors disabled:opacity-40"
              onClick={() =>
                onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
              }
              disabled={item.purchased || item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="min-w-[1.5rem] text-center text-xs font-medium">
              {item.quantity}
              {item.unit ? ` ${item.unit}` : ""}
            </span>
            <button
              className="px-1.5 py-0.5 text-xs hover:bg-muted transition-colors disabled:opacity-40"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={item.purchased}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          {item.store && <span>· {item.store}</span>}
          {item.estimated_price != null && (
            <span>· est. ${item.estimated_price.toFixed(2)}</span>
          )}
        </div>

        {item.purchased && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <label
              htmlFor={`price-${item.id}`}
              className="text-xs text-muted-foreground"
            >
              Actual $
            </label>
            <Input
              ref={priceRef}
              id={`price-${item.id}`}
              type="number"
              min="0"
              step="0.01"
              value={priceInput}
              placeholder={
                item.estimated_price != null
                  ? item.estimated_price.toFixed(2)
                  : "0.00"
              }
              onChange={(e) => setPriceInput(e.target.value)}
              onBlur={() => {
                const n = parseFloat(priceInput);
                if (isNaN(n) || n < 0) {
                  setPriceInput("");
                  onSetActualPrice(item.id, null);
                } else {
                  onSetActualPrice(item.id, n);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              className="h-6 w-20 px-1.5 py-0.5 text-xs"
            />
          </div>
        )}

        {item.notes && (
          <p className="mt-1 text-xs text-muted-foreground italic">
            {item.notes}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
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
          aria-label="Delete item"
          className="h-8 w-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
