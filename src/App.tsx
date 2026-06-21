import { useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { AppLayout } from "@/components/layouts/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
  {
    id: "r3",
    user_id: "demo",
    title: "Carne de res con brócoli",
    description: "Carne en cuadritos salteada con brócoli y salsa Maggi.",
    image_url: null,
    servings: 3,
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    tags: ["carne", "brócoli", "sartén"],
    ingredients: [
      { id: "ri13", name: "Brócoli", quantity: 1, unit: "cabeza" },
      {
        id: "ri14",
        name: "Carne de res en cuadritos (bistec)",
        quantity: 500,
        unit: "g",
      },
      { id: "ri15", name: "Maizena", quantity: 2, unit: "cdas" },
      { id: "ri16", name: "Salsa Maggi", quantity: 1, unit: "al gusto" },
      { id: "ri17", name: "Aceite", quantity: 2, unit: "cdas" },
      { id: "ri18", name: "Sal", quantity: 1, unit: "al gusto" },
      { id: "ri19", name: "Pimienta", quantity: 1, unit: "al gusto" },
    ],
    instructions: [
      "Sazonar el brócoli con aceite y reservar.",
      "Poner los cuadritos de carne en un bowl y mezclar con poca maizena.",
      "En una sartén calentar aceite y cocinar la carne con sal y pimienta hasta que esté lista.",
      "Agregar el brócoli a la carne y revolver poco a poco con salsa Maggi. ¡Listo!",
    ],
    is_favorite: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "r4",
    user_id: "demo",
    title: "Pasta Alfredo",
    description: "Espagueti cremoso con pollo y salsa de crema licuada.",
    image_url: null,
    servings: 4,
    prep_time_minutes: 10,
    cook_time_minutes: 25,
    tags: ["pasta", "pollo", "cremoso"],
    ingredients: [
      { id: "ri20", name: "Espagueti", quantity: 500, unit: "g" },
      { id: "ri21", name: "Crema", quantity: 1, unit: "lata" },
      { id: "ri22", name: "Pimienta", quantity: 1, unit: "al gusto" },
      { id: "ri23", name: "Knorsuiza", quantity: 1, unit: "al gusto" },
      {
        id: "ri24",
        name: "Pollo (en trocitos)",
        quantity: 2,
        unit: "pechugas",
      },
      { id: "ri25", name: "Sal", quantity: 1, unit: "al gusto" },
    ],
    instructions: [
      "Cocer el espagueti en agua con poca sal. Escurrir y reservar.",
      "Licuar la crema con pimienta y Knorsuiza.",
      "Sazonar el pollo en trocitos con pimienta y sal, cocinar hasta que esté listo.",
      "En un refractario combinar el espagueti y el pollo, agregar la crema licuada y mezclar bien.",
    ],
    is_favorite: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "r5",
    user_id: "demo",
    title: "Tortas ahogadas",
    description: "Salsa de chile guajillo con crema para bañar tortas.",
    image_url: null,
    servings: 4,
    prep_time_minutes: 15,
    cook_time_minutes: 30,
    tags: ["tortas", "salsa", "mexicano", "picante"],
    ingredients: [
      { id: "ri26", name: "Chiles guajillo", quantity: 8, unit: null },
      {
        id: "ri27",
        name: "Chiles de árbol (opcional)",
        quantity: 2,
        unit: null,
      },
      { id: "ri28", name: "Dientes de ajo", quantity: 2, unit: null },
      { id: "ri29", name: "Cebolla", quantity: 0.5, unit: "pieza" },
      { id: "ri30", name: "Tomates", quantity: 3, unit: null },
      {
        id: "ri31",
        name: "Crema ácida o media crema",
        quantity: 1,
        unit: "bote mediano",
      },
      {
        id: "ri32",
        name: "Pierna española o lomo de cerdo",
        quantity: 500,
        unit: "g",
      },
      { id: "ri33", name: "Sal o Knorsuiza", quantity: 1, unit: "al gusto" },
    ],
    instructions: [
      "Hervir juntos los chiles, ajo, cebolla y tomates en agua. Una vez hervidos, licuar.",
      "Poner la salsa en una sartén honda y llevar a hervor. Sazonar con sal o Knorsuiza.",
      "Al soltar el hervor, agregar la crema ácida o media crema. Batir constantemente.",
      "Cocinar la pierna o lomo de cerdo en sartén con agua, sal y cebolla.",
      "Puede sustituirse la carne por hamburguesa, jamón o solo aguacate.",
    ],
    is_favorite: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "r6",
    user_id: "demo",
    title: "Pay de queso",
    description: "Pastel de queso cremoso y fácil, listo en 50 minutos.",
    image_url: null,
    servings: 8,
    prep_time_minutes: 10,
    cook_time_minutes: 50,
    tags: ["postre", "queso", "horno"],
    ingredients: [
      { id: "ri34", name: "Lechera grande", quantity: 1, unit: "lata" },
      { id: "ri35", name: "Huevos", quantity: 2, unit: null },
      { id: "ri36", name: "Queso Philadelphia", quantity: 2, unit: "paquetes" },
      { id: "ri37", name: "Vainilla", quantity: 2, unit: "cdas" },
    ],
    instructions: [
      "Moler todos los ingredientes en la licuadora hasta obtener mezcla homogénea.",
      "Verter en un refractario previamente preparado con base de galleta.",
      "Hornear durante 50 minutos.",
    ],
    is_favorite: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "r7",
    user_id: "demo",
    title: "Papas al horno con crema",
    description: "Papas en capas con crema, catsup y queso al horno.",
    image_url: null,
    servings: 4,
    prep_time_minutes: 15,
    cook_time_minutes: 40,
    tags: ["papas", "horno", "crema", "guarnición"],
    ingredients: [
      { id: "ri38", name: "Papas", quantity: 4, unit: null },
      { id: "ri39", name: "Crema de leche", quantity: 0.25, unit: "taza" },
      { id: "ri40", name: "Catsup", quantity: 0.25, unit: "taza" },
      { id: "ri41", name: "Mantequilla", quantity: 1, unit: "cdta" },
      { id: "ri42", name: "Queso rayado", quantity: 1, unit: "al gusto" },
      { id: "ri43", name: "Sal y pimienta", quantity: 1, unit: "al gusto" },
    ],
    instructions: [
      "Pelar las papas y cortar en láminas finas.",
      "Mezclar la crema con la catsup.",
      "Colocar la mitad de las papas en el refractario, salpimentar. Agregar el resto y volver a salpimentar.",
      "Verter la crema por encima, cubrir bien y tapar con papel de aluminio.",
      "Hornear a 250° durante 30 minutos.",
      "Agregar queso rayado y mantequilla, hornear 10 minutos más sin el aluminio.",
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
          <Route
            path="/grocery"
            element={
              <ErrorBoundary>
                <GroceryListPage />
              </ErrorBoundary>
            }
          />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/pantry" element={<PantryPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/grocery" replace />} />
    </Routes>
  );
}
