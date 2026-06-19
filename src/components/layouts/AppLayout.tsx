import { Outlet, NavLink } from "react-router-dom";
import { ShoppingCart, LayoutDashboard } from "lucide-react";

export function AppLayout() {
  const navLink = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-2xl items-center gap-6 px-4 py-3">
          <span className="text-base font-bold tracking-tight">
            🛒 Kitchen Companion
          </span>
          <nav className="hidden gap-4 md:flex">
            <NavLink to="/grocery" className={navLink}>
              Grocery
            </NavLink>
            <NavLink to="/" end className={navLink}>
              Dashboard
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="flex">
          <NavLink
            to="/grocery"
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"}`
            }
          >
            <ShoppingCart className="h-5 w-5" />
            Grocery
          </NavLink>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"}`
            }
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
