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
import type { LibraryItem } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  unit: z.string().optional(),
  estimated_price: z.coerce.number().nonnegative().optional().or(z.literal("")),
  store: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
  defaultValues?: Partial<LibraryItem>;
  title?: string;
}

export function LibraryForm({
  open,
  onClose,
  onSubmit,
  defaultValues,
  title = "New Library Item",
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { name: "", unit: "", store: "", notes: "" },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name ?? "",
        unit: defaultValues.unit ?? "",
        estimated_price:
          defaultValues.estimated_price != null
            ? defaultValues.estimated_price
            : "",
        store: defaultValues.store ?? "",
        notes: defaultValues.notes ?? "",
      });
    } else {
      reset({ name: "", unit: "", store: "", notes: "" });
    }
  }, [defaultValues, open, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const submit = (values: FormValues) => {
    onSubmit(values);
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
            <Label htmlFor="lib-name">Name *</Label>
            <Input
              id="lib-name"
              {...register("name")}
              placeholder="e.g. Whole Milk"
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="lib-unit">Unit</Label>
              <Input
                id="lib-unit"
                {...register("unit")}
                placeholder="e.g. gallon"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lib-price">Price ($)</Label>
              <Input
                id="lib-price"
                type="number"
                step="0.01"
                min="0"
                {...register("estimated_price")}
                placeholder="0.00"
              />
              {errors.estimated_price && (
                <p className="text-sm text-red-500">
                  {errors.estimated_price.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="lib-store">Store</Label>
            <Input
              id="lib-store"
              {...register("store")}
              placeholder="e.g. Costco"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="lib-notes">Notes</Label>
            <Input
              id="lib-notes"
              {...register("notes")}
              placeholder="e.g. Organic, boneless, etc."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
