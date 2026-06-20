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

  useEffect(() => {
    setPriceInput(item.actual_price != null ? String(item.actual_price) : "");
  }, [item.actual_price]);

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border bg-card px-4 py-3.5 transition-opacity ${
        item.purchased ? "opacity-55" : ""
      }`}
    >
      <Checkbox
        checked={item.purchased}
        onCheckedChange={(checked) => {
          onToggle(item.id, !!checked);
          if (checked) setTimeout(() => priceRef.current?.focus(), 50);
        }}
        aria-label={`Mark ${item.name} as purchased`}
        className="h-5 w-5 shrink-0 rounded-full"
      />

      <div className="min-w-0 flex-1">
        {/* Name + category */}
        <div className="flex flex-wrap items-baseline gap-2">
          <span
            className={`text-[15px] font-semibold leading-snug ${
              item.purchased
                ? "text-muted-foreground line-through"
                : "text-foreground"
            }`}
          >
            {item.name}
          </span>
          {item.categories && (
            <Badge variant="secondary" className="text-[10px]">
              {item.categories.name}
            </Badge>
          )}
        </div>

        {/* Meta row */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {/* Quantity stepper */}
          <div className="flex items-center overflow-hidden rounded-lg border bg-muted/40">
            <button
              className="px-2 py-1 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-30"
              onClick={() =>
                onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
              }
              disabled={item.purchased || item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="min-w-[2rem] border-x px-1 text-center text-xs font-medium">
              {item.quantity}
              {item.unit ? ` ${item.unit}` : ""}
            </span>
            <button
              className="px-2 py-1 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-30"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={item.purchased}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {item.store && (
            <span className="font-medium text-muted-foreground">
              {item.store}
            </span>
          )}
          {item.estimated_price != null && (
            <span>est. ${item.estimated_price.toFixed(2)}</span>
          )}
        </div>

        {/* Actual price input (after purchase) */}
        {item.purchased && (
          <div className="mt-2 flex items-center gap-2">
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
              className="h-7 w-24 px-2 text-xs"
            />
          </div>
        )}

        {item.notes && (
          <p className="mt-1 text-xs italic text-muted-foreground">
            {item.notes}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 flex-col gap-0.5">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onEdit(item)}
          aria-label="Edit item"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(item.id)}
          aria-label="Delete item"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
