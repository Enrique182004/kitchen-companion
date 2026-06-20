import { Pencil, Trash2, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { expiryStatus, daysUntilExpiry } from "../pantry.store";
import type { PantryItem } from "@/types";

interface Props {
  item: PantryItem;
  onEdit: (item: PantryItem) => void;
  onDelete: (id: string) => void;
}

function ExpiryBadge({ date }: { date: string | null }) {
  const status = expiryStatus(date);
  if (status === "none") return null;

  if (status === "expired") {
    return (
      <Badge variant="destructive" className="gap-1 text-xs">
        <AlertTriangle className="h-3 w-3" />
        Expired
      </Badge>
    );
  }

  const days = daysUntilExpiry(date!);
  if (status === "soon") {
    return (
      <Badge className="gap-1 bg-yellow-500 text-xs text-white hover:bg-yellow-500">
        <Clock className="h-3 w-3" />
        {days}d left
      </Badge>
    );
  }

  return (
    <span className="text-xs text-muted-foreground">
      Exp {new Date(date!).toLocaleDateString()}
    </span>
  );
}

export function PantryItemRow({ item, onEdit, onDelete }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{item.name}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {item.quantity}
            {item.unit ? ` ${item.unit}` : ""}
          </span>
          <ExpiryBadge date={item.expiration_date} />
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onEdit(item)}
          aria-label="Edit pantry item"
          className="h-8 w-8"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(item.id)}
          aria-label="Remove from pantry"
          className="h-8 w-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
