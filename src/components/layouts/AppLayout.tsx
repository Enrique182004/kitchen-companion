import { Outlet, NavLink } from "react-router-dom";
import { ShoppingCart, LayoutDashboard } from "lucide-react";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Desktop top nav */}
      <header className="hidden items-center gap-6 border-b px-6 py-3 md:flex">
        <span className="text-lg font-bold">Kitchen Companion</span>
        <nav className="flex gap-4">
          <NavLink
            to="/grocery"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`
            }
          >
            Grocery
          </NavLink>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`
            }
          >
            Dashboard
          </NavLink>
        </nav>
      </header>

      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 flex border-t bg-background md:hidden">
        <NavLink
          to="/grocery"
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-3 text-xs ${isActive ? "text-primary" : "text-muted-foreground"}`
          }
        >
          <ShoppingCart className="h-5 w-5" />
          Grocery
        </NavLink>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-3 text-xs ${isActive ? "text-primary" : "text-muted-foreground"}`
          }
        >
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </NavLink>
      </nav>
    </div>
  );
}
