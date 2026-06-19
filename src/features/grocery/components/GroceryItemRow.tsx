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
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 ${item.purchased ? "bg-muted/30 opacity-60" : "bg-card"}`}
    >
      <Checkbox
        checked={item.purchased}
        onCheckedChange={(checked) => onToggle(item.id, !!checked)}
        aria-label={`Mark ${item.name} as purchased`}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`truncate font-medium ${item.purchased ? "text-muted-foreground line-through" : ""}`}
          >
            {item.name}
          </span>
          {item.categories && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              {item.categories.name}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {item.quantity}
          {item.unit ? ` ${item.unit}` : ""}
          {item.store ? ` · ${item.store}` : ""}
          {item.estimated_price != null
            ? ` · $${item.estimated_price.toFixed(2)}`
            : ""}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onEdit(item)}
          aria-label="Edit item"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(item.id)}
          aria-label="Delete item"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
