import type { Control, UseFieldArrayReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RecipeFormValues } from "../recipe.store";

interface Props {
  control: Control<RecipeFormValues>;
}

export function InstructionFields({ control }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "instructions",
  }) as UseFieldArrayReturn<RecipeFormValues, "instructions">;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Steps</p>
      {fields.map((field, i) => (
        <div key={field.id} className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
            {i + 1}
          </span>
          <Input
            {...control.register(`instructions.${i}.text` as const)}
            placeholder={`Step ${i + 1}`}
            className="flex-1"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => remove(i)}
            disabled={fields.length === 1}
            aria-label="Remove step"
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
        onClick={() => append({ text: "" })}
        className="w-full"
      >
        <Plus className="mr-1 h-4 w-4" />
        Add Step
      </Button>
    </div>
  );
}
