import { useEffect, useState } from "react";
import {
  Clock,
  Users,
  Star,
  Pencil,
  Trash2,
  ShoppingCart,
  Plus,
  Minus,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGroceryList } from "@/features/grocery/hooks/use-grocery-list";
import { toast } from "sonner";
import type { Recipe } from "@/types";

interface Props {
  recipe: Recipe | null;
  open: boolean;
  onClose: () => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function RecipeDetailSheet({
  recipe,
  open,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
}: Props) {
  const [servings, setServings] = useState(recipe?.servings ?? 1);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const { add } = useGroceryList();

  // Reset when recipe changes or after edit (ingredient IDs are regenerated on update)
  const ingredientKey = recipe?.ingredients.map((i) => i.id).join(",") ?? "";
  useEffect(() => {
    setServings(recipe?.servings ?? 1);
    setChecked(new Set());
  }, [recipe?.id, ingredientKey]);

  if (!recipe) return null;

  const baseServings = Math.max(1, recipe.servings ?? 1);
  const mult = servings / baseServings;

  const toggleAll = (on: boolean) =>
    setChecked(on ? new Set(recipe.ingredients.map((i) => i.id)) : new Set());

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      setServings(recipe.servings ?? 1);
      setChecked(new Set());
      onClose();
    }
  };

  const handleAddToCart = async () => {
    const selected = recipe.ingredients.filter((i) => checked.has(i.id));
    await Promise.all(
      selected.map((i) =>
        add({
          name: i.name,
          quantity: Math.round(i.quantity * mult * 100) / 100,
          unit: i.unit ?? null,
          estimated_price: undefined,
          store: null,
          notes: null,
          category_id: null,
          purchased: false,
        }),
      ),
    );
    toast.success(
      `${selected.length} ingredient${selected.length !== 1 ? "s" : ""} added to grocery list`,
    );
    setChecked(new Set());
  };

  const totalMins =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 pr-8">
            <SheetTitle className="text-left">{recipe.title}</SheetTitle>
            <div className="flex shrink-0 gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => onToggleFavorite(recipe.id)}
                aria-label={recipe.is_favorite ? "Unfavorite" : "Favorite"}
              >
                <Star
                  className={`h-4 w-4 ${recipe.is_favorite ? "fill-yellow-400 text-yellow-400" : ""}`}
                />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => onEdit(recipe)}
                aria-label="Edit recipe"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => {
                  onDelete(recipe.id);
                  onClose();
                }}
                aria-label="Delete recipe"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {recipe.description && (
            <p className="text-left text-sm text-muted-foreground">
              {recipe.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            {recipe.tags.map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
            {totalMins > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {totalMins} min
              </span>
            )}
          </div>
        </SheetHeader>

        <Separator />

        <ScrollArea className="flex-1">
          <div className="space-y-5 py-4">
            {recipe.ingredients.length > 0 && (
              <div className="space-y-3 px-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Ingredients</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Servings
                    </span>
                    <div className="flex items-center rounded-md border">
                      <button
                        className="px-2 py-1 text-xs hover:bg-muted"
                        onClick={() => setServings((s) => Math.max(1, s - 1))}
                        aria-label="Decrease servings"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="min-w-6 text-center text-xs font-medium">
                        {servings}
                      </span>
                      <button
                        className="px-2 py-1 text-xs hover:bg-muted"
                        onClick={() => setServings((s) => s + 1)}
                        aria-label="Increase servings"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                  <Checkbox
                    checked={
                      checked.size === recipe.ingredients.length
                        ? true
                        : checked.size > 0
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={(v) => toggleAll(v === true)}
                  />
                  Select all
                </label>
                <div className="space-y-2">
                  {recipe.ingredients.map((ing) => {
                    const scaledQty =
                      Math.round(ing.quantity * mult * 100) / 100;
                    return (
                      <label
                        key={ing.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-2"
                      >
                        <Checkbox
                          checked={checked.has(ing.id)}
                          onCheckedChange={(v) =>
                            setChecked((prev) => {
                              const next = new Set(prev);
                              v ? next.add(ing.id) : next.delete(ing.id);
                              return next;
                            })
                          }
                        />
                        <span className="flex-1 text-sm">{ing.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {scaledQty}
                          {ing.unit ? ` ${ing.unit}` : ""}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <Button
                  onClick={handleAddToCart}
                  className="w-full"
                  disabled={checked.size === 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add{checked.size > 0 ? ` ${checked.size}` : ""} to Grocery
                  List
                </Button>
              </div>
            )}

            {recipe.instructions.length > 0 && (
              <div className="space-y-3 px-1">
                <p className="text-sm font-semibold">Steps</p>
                <div className="space-y-3">
                  {recipe.instructions.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <p className="pt-0.5 text-sm leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
