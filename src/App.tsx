import { Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { AppLayout } from "@/components/layouts/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthPage } from "@/app/AuthPage";
import { GroceryListPage } from "@/app/GroceryListPage";
import { DashboardPage } from "@/app/DashboardPage";

export function App() {
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
