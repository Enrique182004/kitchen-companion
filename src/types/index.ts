export interface Category {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

export interface GroceryItem {
  id: string;
  user_id: string;
  name: string;
  quantity: number;
  unit: string | null;
  category_id: string | null;
  estimated_price: number | null;
  actual_price: number | null;
  store: string | null;
  purchased: boolean;
  notes: string | null;
  recurring?: boolean;
  created_at: string;
  updated_at: string;
  categories?: Pick<Category, "id" | "name"> | null;
}

export type GroceryItemInsert = Omit<
  GroceryItem,
  "id" | "created_at" | "updated_at" | "categories"
>;
export type GroceryItemUpdate = Partial<
  Omit<GroceryItem, "id" | "user_id" | "created_at" | "categories">
>;

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
}

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  servings: number | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  tags: string[];
  ingredients: RecipeIngredient[];
  instructions: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface PantryItem {
  id: string;
  user_id: string;
  name: string;
  quantity: number;
  unit: string | null;
  category_id: string | null;
  expiration_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface MealPlan {
  id: string;
  user_id: string;
  recipe_id: string;
  planned_date: string;
  meal_type: "breakfast" | "lunch" | "dinner";
  created_at: string;
}

export interface PriceHistory {
  id: string;
  user_id: string;
  item_name: string;
  price: number;
  store: string | null;
  purchased_at: string;
}

export type SortBy = "name" | "category" | "created_at" | "store";

export interface LibraryItem {
  id: string;
  name: string;
  unit: string;
  estimated_price: number | null;
  store: string | null;
  notes: string | null;
  times_added: number;
  last_added: string;
  is_favorite: boolean;
}
