import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { AppLayout } from "@/components/layouts/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthPage } from "@/app/AuthPage";
import { GroceryListPage } from "@/app/GroceryListPage";
import { DashboardPage } from "@/app/DashboardPage";
import { useGroceryStore } from "@/features/grocery/grocery.store";
import type { GroceryItem } from "@/types";

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

export function App() {
  const setItems = useGroceryStore((s) => s.setItems);
  const items = useGroceryStore((s) => s.items);

  useEffect(() => {
    if (!import.meta.env.VITE_SUPABASE_URL && items.length === 0) {
      setItems(DEMO_ITEMS);
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
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/grocery" replace />} />
    </Routes>
  );
}
