import { Outlet, NavLink } from "react-router-dom";
import {
  ShoppingCart,
  BookOpen,
  ChefHat,
  Package,
  Sun,
  Moon,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGroceryStore } from "@/features/grocery/grocery.store";
import { useTheme } from "@/hooks/use-theme";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { GlobalSearch } from "@/components/GlobalSearch";
import { NotificationBell } from "@/features/notifications/NotificationBell";

const NAV_ITEMS = [
  { to: "/grocery", label: "Grocery", Icon: ShoppingCart },
  { to: "/recipes", label: "Recipes", Icon: ChefHat },
  { to: "/pantry", label: "Pantry", Icon: Package },
  { to: "/library", label: "Library", Icon: BookOpen },
  { to: "/", label: "Home", Icon: LayoutDashboard, end: true },
];

export function AppLayout() {
  const { theme, toggle } = useTheme();
  const isOnline = useOnlineStatus();
  const unpurchasedCount = useGroceryStore(
    (s) => s.items.filter((i) => !i.purchased).length,
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-3">
          <span className="text-base font-bold tracking-tight text-primary">
            Kitchen Companion
          </span>

          {/* Desktop nav */}
          <nav className="hidden flex-1 gap-1 md:flex">
            {NAV_ITEMS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-secondary text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`
                }
              >
                {label}
                {label === "Grocery" && unpurchasedCount > 0 && (
                  <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {unpurchasedCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <GlobalSearch />
            <NotificationBell />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="h-8 w-8"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Offline banner */}
      {!isOnline && (
        <div className="border-b border-yellow-200 bg-yellow-50 px-4 py-1.5 text-center text-xs text-yellow-800 dark:border-yellow-800 dark:text-yellow-200">
          You're offline — changes will sync when reconnected
        </div>
      )}

      <main className="flex-1 pb-24 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-stretch">
          {NAV_ITEMS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="flex flex-1 flex-col items-center justify-center py-2"
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`relative flex items-center justify-center rounded-2xl px-3 py-1.5 transition-colors ${
                      isActive
                        ? "bg-secondary text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {label === "Grocery" && unpurchasedCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                        {unpurchasedCount}
                      </span>
                    )}
                  </div>
                  <span
                    className={`mt-0.5 text-[10px] font-medium transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
