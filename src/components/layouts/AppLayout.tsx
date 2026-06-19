import { Outlet, NavLink } from "react-router-dom";
import { ShoppingCart, LayoutDashboard, BookOpen } from "lucide-react";

export function AppLayout() {
  const desktopLink = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`;

  const mobileLink = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"}`;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-2xl items-center gap-6 px-4 py-3">
          <span className="text-base font-bold tracking-tight">
            🛒 Kitchen Companion
          </span>
          <nav className="hidden gap-4 md:flex">
            <NavLink to="/grocery" className={desktopLink}>
              Grocery
            </NavLink>
            <NavLink to="/library" className={desktopLink}>
              Library
            </NavLink>
            <NavLink to="/" end className={desktopLink}>
              Dashboard
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav — Grocery + Library only (Dashboard is desktop-only) */}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="flex">
          <NavLink to="/grocery" className={mobileLink}>
            <ShoppingCart className="h-5 w-5" />
            Grocery
          </NavLink>
          <NavLink to="/library" className={mobileLink}>
            <BookOpen className="h-5 w-5" />
            Library
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
