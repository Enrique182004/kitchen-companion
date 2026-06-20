import { useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { AppLayout } from "@/components/layouts/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthPage } from "@/app/AuthPage";
import { GroceryListPage } from "@/app/GroceryListPage";
import { DashboardPage } from "@/app/DashboardPage";
import { LibraryPage } from "@/app/LibraryPage";
import { RecipesPage } from "@/app/RecipesPage";
import { PantryPage } from "@/app/PantryPage";
import { useGroceryStore } from "@/features/grocery/grocery.store";
import { useRecipeStore } from "@/features/recipe/recipe.store";
import type { GroceryItem, Recipe } from "@/types";

const DEMO_ITEMS: GroceryItem[] = [
  {
    id: "1",
    user_id: "demo",
    name: "Whole Milk",
    quantity: 1,
    unit: "gallon",
    category_id: null,
    estimated_price: 4.99,
    actual_price: null,
    store: "Walmart",
    purchased: false,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    user_id: "demo",
    name: "Sourdough Bread",
    quantity: 1,
    unit: "loaf",
    category_id: null,
    estimated_price: 5.49,
    actual_price: 5.49,
    store: "Trader Joe's",
    purchased: true,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    user_id: "demo",
    name: "Chicken Breast",
    quantity: 2,
    unit: "lbs",
    category_id: null,
    estimated_price: 8.99,
    actual_price: null,
    store: "Costco",
    purchased: false,
    notes: "Boneless skinless",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    user_id: "demo",
    name: "Eggs",
    quantity: 1,
    unit: "dozen",
    category_id: null,
    estimated_price: 3.79,
    actual_price: null,
    store: "Walmart",
    purchased: false,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    user_id: "demo",
    name: "Avocados",
    quantity: 4,
    unit: "",
    category_id: null,
    estimated_price: 1.25,
    actual_price: 1.1,
    store: "Trader Joe's",
    purchased: true,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "6",
    user_id: "demo",
    name: "Greek Yogurt",
    quantity: 2,
    unit: "cups",
    category_id: null,
    estimated_price: 2.49,
    actual_price: null,
    store: null,
    purchased: false,
    notes: "Plain, full fat",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEMO_RECIPES: Recipe[] = [
  {
    id: "r1",
    user_id: "demo",
    title: "Chicken Stir Fry",
    description: "Quick weeknight dinner with vegetables and savory sauce.",
    image_url: null,
    servings: 4,
    prep_time_minutes: 15,
    cook_time_minutes: 20,
    tags: ["chicken", "quick", "asian"],
    ingredients: [
      { id: "ri1", name: "Chicken breast", quantity: 1.5, unit: "lbs" },
      { id: "ri2", name: "Broccoli", quantity: 2, unit: "cups" },
      { id: "ri3", name: "Bell pepper", quantity: 1, unit: null },
      { id: "ri4", name: "Soy sauce", quantity: 3, unit: "tbsp" },
      { id: "ri5", name: "Garlic cloves", quantity: 3, unit: null },
      { id: "ri6", name: "Vegetable oil", quantity: 2, unit: "tbsp" },
    ],
    instructions: [
      "Slice chicken into thin strips. Season with salt and pepper.",
      "Heat oil in a large wok or skillet over high heat.",
      "Stir fry chicken until golden, about 5–6 minutes. Remove and set aside.",
      "Add vegetables and garlic, stir fry 3–4 minutes until tender-crisp.",
      "Return chicken to pan, add soy sauce, toss to combine and serve.",
    ],
    is_favorite: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "r2",
    user_id: "demo",
    title: "Classic Guacamole",
    description: "Fresh and simple guac ready in 10 minutes.",
    image_url: null,
    servings: 6,
    prep_time_minutes: 10,
    cook_time_minutes: 0,
    tags: ["snack", "vegetarian", "mexican"],
    ingredients: [
      { id: "ri7", name: "Avocados", quantity: 3, unit: null },
      { id: "ri8", name: "Lime juice", quantity: 2, unit: "tbsp" },
      { id: "ri9", name: "Red onion", quantity: 0.25, unit: "cup" },
      { id: "ri10", name: "Cilantro", quantity: 2, unit: "tbsp" },
      { id: "ri11", name: "Jalapeño", quantity: 1, unit: null },
      { id: "ri12", name: "Salt", quantity: 0.5, unit: "tsp" },
    ],
    instructions: [
      "Halve and pit the avocados. Scoop flesh into a bowl.",
      "Mash with a fork to desired consistency.",
      "Fold in lime juice, onion, cilantro, and jalapeño.",
      "Season with salt. Taste and adjust. Serve immediately.",
    ],
    is_favorite: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function App() {
  const setItems = useGroceryStore((s) => s.setItems);
  const items = useGroceryStore((s) => s.items);
  const recipes = useRecipeStore((s) => s.recipes);
  const createRecipe = useRecipeStore((s) => s.createRecipe);
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    if (!import.meta.env.VITE_SUPABASE_URL && items.length === 0) {
      setItems(DEMO_ITEMS);
    }
    if (!import.meta.env.VITE_SUPABASE_URL && recipes.length === 0) {
      DEMO_RECIPES.forEach((r) =>
        createRecipe({
          title: r.title,
          description: r.description ?? "",
          servings: r.servings,
          prep_time_minutes: r.prep_time_minutes,
          cook_time_minutes: r.cook_time_minutes,
          tags: r.tags.join(", "),
          ingredients: r.ingredients.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            unit: i.unit ?? "",
          })),
          instructions: r.instructions.map((t) => ({ text: t })),
        }),
      );
    }
  }, []);

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/auth" element={<AuthPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/grocery" element={<GroceryListPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/pantry" element={<PantryPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/grocery" replace />} />
    </Routes>
  );
}
