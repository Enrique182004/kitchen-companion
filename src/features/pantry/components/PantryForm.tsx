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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PANTRY_CATEGORIES } from "../pantry.store";
import type { PantryFormValues } from "../pantry.store";
import type { PantryItem } from "@/types";

const pantrySchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unit: z.string(),
  expiration_date: z.string(),
  category: z.string(),
});

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PantryFormValues) => void;
  defaultValues?: PantryItem;
  title?: string;
}

const EMPTY: PantryFormValues = {
  name: "",
  quantity: 1,
  unit: "",
  expiration_date: "",
  category: "",
};

export function PantryForm({
  open,
  onClose,
  onSubmit,
  defaultValues,
  title = "Add to Pantry",
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PantryFormValues>({
    resolver: zodResolver(pantrySchema) as Resolver<PantryFormValues>,
    defaultValues: EMPTY,
  });

  const categoryValue = watch("category");

  useEffect(() => {
    reset(
      defaultValues
        ? {
            name: defaultValues.name,
            quantity: defaultValues.quantity,
            unit: defaultValues.unit ?? "",
            expiration_date: defaultValues.expiration_date ?? "",
            category: defaultValues.category_id ?? "",
          }
        : EMPTY,
    );
  }, [defaultValues, reset, open]);

  const submit = (values: PantryFormValues) => {
    onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="pantry-name">Item *</Label>
            <Input
              id="pantry-name"
              {...register("name")}
              placeholder="e.g. Olive Oil"
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="pantry-qty">Quantity</Label>
              <Input
                id="pantry-qty"
                type="number"
                min="1"
                step="0.01"
                {...register("quantity")}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">
                  {errors.quantity.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="pantry-unit">Unit</Label>
              <Input
                id="pantry-unit"
                {...register("unit")}
                placeholder="e.g. oz"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Category</Label>
            <Select
              value={categoryValue}
              onValueChange={(v) =>
                setValue("category", v && v !== "none" ? v : "")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {PANTRY_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="pantry-exp">Expiration Date</Label>
            <Input
              id="pantry-exp"
              type="date"
              {...register("expiration_date")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
