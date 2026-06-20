import { Outlet, NavLink } from "react-router-dom";
import {
  ShoppingCart,
  BookOpen,
  ChefHat,
  Package,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGroceryStore } from "@/features/grocery/grocery.store";
import { useTheme } from "@/hooks/use-theme";

export function AppLayout() {
  const { theme, toggle } = useTheme();
  const unpurchasedCount = useGroceryStore(
    (s) => s.items.filter((i) => !i.purchased).length,
  );

  const desktopLink = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`;

  const mobileLink = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"}`;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-3">
          <span className="text-base font-bold tracking-tight">
            🛒 Kitchen Companion
          </span>
          <nav className="hidden flex-1 gap-4 md:flex">
            <NavLink to="/grocery" className={desktopLink}>
              Grocery
              {unpurchasedCount > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {unpurchasedCount}
                </span>
              )}
            </NavLink>
            <NavLink to="/recipes" className={desktopLink}>
              Recipes
            </NavLink>
            <NavLink to="/pantry" className={desktopLink}>
              Pantry
            </NavLink>
            <NavLink to="/library" className={desktopLink}>
              Library
            </NavLink>
            <NavLink to="/" end className={desktopLink}>
              Dashboard
            </NavLink>
          </nav>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="ml-auto h-8 w-8"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="flex">
          <NavLink to="/grocery" className={mobileLink}>
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {unpurchasedCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {unpurchasedCount}
                </span>
              )}
            </div>
            Grocery
          </NavLink>
          <NavLink to="/recipes" className={mobileLink}>
            <ChefHat className="h-5 w-5" />
            Recipes
          </NavLink>
          <NavLink to="/pantry" className={mobileLink}>
            <Package className="h-5 w-5" />
            Pantry
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
