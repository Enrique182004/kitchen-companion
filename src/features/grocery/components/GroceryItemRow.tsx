import { Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { GroceryItem } from "@/types";

interface Props {
  item: GroceryItem;
  onToggle: (id: string, purchased: boolean) => void;
  onEdit: (item: GroceryItem) => void;
  onDelete: (id: string) => void;
}

export function GroceryItemRow({ item, onToggle, onEdit, onDelete }: Props) {
  const dimmed = item.purchased ? "opacity-50" : "";

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border bg-card p-3 shadow-sm transition-opacity ${dimmed}`}
    >
      <Checkbox
        checked={item.purchased}
        onCheckedChange={(checked) => onToggle(item.id, !!checked)}
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

        <div className="mt-0.5 flex flex-wrap gap-x-2 text-sm text-muted-foreground">
          <span>
            {item.quantity}
            {item.unit ? ` ${item.unit}` : ""}
          </span>
          {item.store && <span>· {item.store}</span>}
          {item.estimated_price != null && (
            <span>· ${item.estimated_price.toFixed(2)}</span>
          )}
        </div>

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
