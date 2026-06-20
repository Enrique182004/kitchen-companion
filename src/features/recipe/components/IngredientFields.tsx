import type { Control, UseFieldArrayReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RecipeFormValues } from "../recipe.store";

interface Props {
  control: Control<RecipeFormValues>;
}

export function IngredientFields({ control }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  }) as UseFieldArrayReturn<RecipeFormValues, "ingredients">;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Ingredients</p>
      {fields.map((field, i) => (
        <div key={field.id} className="flex gap-2">
          <Input
            {...control.register(`ingredients.${i}.quantity` as const, {
              valueAsNumber: true,
            })}
            type="number"
            min="0"
            step="0.01"
            placeholder="Qty"
            className="w-16 shrink-0"
          />
          <Input
            {...control.register(`ingredients.${i}.unit` as const)}
            placeholder="Unit"
            className="w-20 shrink-0"
          />
          <Input
            {...control.register(`ingredients.${i}.name` as const)}
            placeholder="Ingredient name"
            className="flex-1"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => remove(i)}
            disabled={fields.length === 1}
            aria-label="Remove ingredient"
            className="h-9 w-9 shrink-0 text-destructive hover:text-destructive disabled:opacity-30"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ name: "", quantity: 1, unit: "" })}
        className="w-full"
      >
        <Plus className="mr-1 h-4 w-4" />
        Add Ingredient
      </Button>
    </div>
  );
}
