import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  groceryItemSchema,
  type GroceryItemFormValues,
} from "@/lib/zod-schemas";
import { useCategories } from "../hooks/use-categories";
import type { GroceryItem } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: GroceryItemFormValues) => Promise<void>;
  defaultValues?: Partial<GroceryItem>;
  title?: string;
}

export function GroceryForm({
  open,
  onClose,
  onSubmit,
  defaultValues,
  title = "Add Item",
}: Props) {
  const { categories } = useCategories();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GroceryItemFormValues>({
    resolver: zodResolver(groceryItemSchema),
    defaultValues: { name: "", quantity: 1, unit: "", purchased: false },
  });

  const categoryId = watch("category_id");

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name ?? "",
        quantity: defaultValues.quantity ?? 1,
        unit: defaultValues.unit ?? "",
        category_id: defaultValues.category_id ?? undefined,
        estimated_price: defaultValues.estimated_price ?? undefined,
        store: defaultValues.store ?? "",
        notes: defaultValues.notes ?? "",
      });
    }
  }, [defaultValues, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const submit = async (values: GroceryItemFormValues) => {
    await onSubmit(values);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="item-name">Name *</Label>
            <Input
              id="item-name"
              {...register("name")}
              placeholder="e.g. Whole milk"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="item-qty">Quantity *</Label>
              <Input
                id="item-qty"
                type="number"
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
              <Label htmlFor="item-unit">Unit</Label>
              <Input
                id="item-unit"
                {...register("unit")}
                placeholder="e.g. lbs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Category</Label>
            <Select
              value={categoryId ?? ""}
              onValueChange={(v) => setValue("category_id", v || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="item-price">Est. Price ($)</Label>
              <Input
                id="item-price"
                type="number"
                step="0.01"
                {...register("estimated_price")}
                placeholder="0.00"
              />
              {errors.estimated_price && (
                <p className="text-sm text-red-500">
                  {errors.estimated_price.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="item-store">Store</Label>
              <Input
                id="item-store"
                {...register("store")}
                placeholder="e.g. Walmart"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="item-notes">Notes</Label>
            <Input
              id="item-notes"
              {...register("notes")}
              placeholder="Optional note"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
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
