import { z } from "zod";

export const groceryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit: z.string().optional(),
  category_id: z.string().nullable().optional(),
  estimated_price: z.coerce
    .number()
    .min(0, "Price cannot be negative")
    .nullable()
    .optional(),
  actual_price: z.coerce
    .number()
    .min(0, "Price cannot be negative")
    .nullable()
    .optional(),
  store: z.string().optional(),
  purchased: z.boolean().optional().default(false),
  notes: z.string().optional(),
  recurring: z.boolean().optional(),
});

export type GroceryItemFormValues = z.infer<typeof groceryItemSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = loginSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
