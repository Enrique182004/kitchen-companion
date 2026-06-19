import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/auth.store";

export function ProtectedRoute() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user && !import.meta.env.VITE_SUPABASE_URL) return <Outlet />;

  return user ? <Outlet /> : <Navigate to="/auth" replace />;
}
