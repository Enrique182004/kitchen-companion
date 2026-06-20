import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IngredientFields } from "./IngredientFields";
import { InstructionFields } from "./InstructionFields";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLibraryStore } from "@/features/library/library.store";
import type { RecipeFormValues } from "../recipe.store";
import type { Recipe } from "@/types";

const nanToNull = z.preprocess(
  (v) => (typeof v === "number" && isNaN(v) ? null : v),
  z.number().min(0).nullable(),
);

const recipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  servings: nanToNull,
  prep_time_minutes: nanToNull,
  cook_time_minutes: nanToNull,
  tags: z.string(),
  ingredients: z.array(
    z.object({ name: z.string(), quantity: z.any(), unit: z.string() }),
  ),
  instructions: z.array(z.object({ text: z.string() })),
});

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: RecipeFormValues) => void;
  defaultValues?: Recipe;
  importDefaults?: RecipeFormValues;
  title?: string;
}

const DEFAULT: RecipeFormValues = {
  title: "",
  description: "",
  servings: null,
  prep_time_minutes: null,
  cook_time_minutes: null,
  tags: "",
  ingredients: [{ name: "", quantity: 1, unit: "" }],
  instructions: [{ text: "" }],
};

function recipeToForm(r: Recipe): RecipeFormValues {
  return {
    title: r.title,
    description: r.description ?? "",
    servings: r.servings,
    prep_time_minutes: r.prep_time_minutes,
    cook_time_minutes: r.cook_time_minutes,
    tags: r.tags.join(", "),
    ingredients: r.ingredients.length
      ? r.ingredients.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit: i.unit ?? "",
        }))
      : [{ name: "", quantity: 1, unit: "" }],
    instructions: r.instructions.length
      ? r.instructions.map((t) => ({ text: t }))
      : [{ text: "" }],
  };
}

export function RecipeForm({
  open,
  onClose,
  onSubmit,
  defaultValues,
  importDefaults,
  title = "New Recipe",
}: Props) {
  const createLibraryItem = useLibraryStore((s) => s.createItem);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema) as Resolver<RecipeFormValues>,
    defaultValues: DEFAULT,
  });

  useEffect(() => {
    if (importDefaults) {
      reset(importDefaults);
    } else {
      reset(defaultValues ? recipeToForm(defaultValues) : DEFAULT);
    }
  }, [defaultValues, importDefaults, reset, open]);

  const submit = (values: RecipeFormValues) => {
    onSubmit(values);
    values.ingredients.forEach((ing) => {
      if (ing.name.trim()) {
        createLibraryItem({ name: ing.name.trim() });
      }
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 overflow-y-auto pr-1">
          <form
            id="recipe-form"
            onSubmit={handleSubmit(submit)}
            className="space-y-4 pb-2"
          >
            <div className="space-y-1">
              <Label htmlFor="recipe-title">Title *</Label>
              <Input
                id="recipe-title"
                {...register("title")}
                placeholder="e.g. Chicken Stir Fry"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="recipe-desc">Description</Label>
              <Input
                id="recipe-desc"
                {...register("description")}
                placeholder="Short description"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label htmlFor="recipe-servings">Servings</Label>
                <Input
                  id="recipe-servings"
                  type="number"
                  min="1"
                  {...register("servings", { valueAsNumber: true })}
                  placeholder="4"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="recipe-prep">Prep (min)</Label>
                <Input
                  id="recipe-prep"
                  type="number"
                  min="0"
                  {...register("prep_time_minutes", { valueAsNumber: true })}
                  placeholder="15"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="recipe-cook">Cook (min)</Label>
                <Input
                  id="recipe-cook"
                  type="number"
                  min="0"
                  {...register("cook_time_minutes", { valueAsNumber: true })}
                  placeholder="30"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="recipe-tags">Tags</Label>
              <Input
                id="recipe-tags"
                {...register("tags")}
                placeholder="e.g. chicken, quick, asian"
              />
            </div>

            <IngredientFields control={control} />
            <InstructionFields control={control} />
          </form>
        </ScrollArea>
        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="recipe-form" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save Recipe"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
