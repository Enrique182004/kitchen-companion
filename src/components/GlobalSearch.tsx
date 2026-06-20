import * as React from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGroceryStore } from "@/features/grocery/grocery.store";
import { useRecipeStore } from "@/features/recipe/recipe.store";
import { usePantryStore } from "@/features/pantry/pantry.store";
import { useLibraryStore } from "@/features/library/library.store";

interface Result {
  id: string;
  label: string;
  category: string;
  path: string;
}

function useSearchResults(query: string): Result[] {
  const groceryItems = useGroceryStore((s) => s.items);
  const recipes = useRecipeStore((s) => s.recipes);
  const pantryItems = usePantryStore((s) => s.items);
  const libraryItems = useLibraryStore((s) => s.items);

  if (!query.trim()) return [];
  const q = query.toLowerCase();

  const results: Result[] = [
    ...groceryItems
      .filter((i) => i.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map((i) => ({
        id: i.id,
        label: i.name,
        category: "Grocery",
        path: "/grocery",
      })),
    ...recipes
      .filter((r) => r.title.toLowerCase().includes(q))
      .slice(0, 3)
      .map((r) => ({
        id: r.id,
        label: r.title,
        category: "Recipes",
        path: "/recipes",
      })),
    ...pantryItems
      .filter((i) => i.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map((i) => ({
        id: i.id,
        label: i.name,
        category: "Pantry",
        path: "/pantry",
      })),
    ...libraryItems
      .filter((i) => i.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map((i) => ({
        id: i.id,
        label: i.name,
        category: "Library",
        path: "/library",
      })),
  ];

  return results;
}

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const navigate = useNavigate();
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const results = useSearchResults(query);

  const grouped = React.useMemo(() => {
    const map = new Map<string, Result[]>();
    for (const r of results) {
      const arr = map.get(r.category) ?? [];
      arr.push(r);
      map.set(r.category, arr);
    }
    return map;
  }, [results]);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery("");
    }
  }, [open]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) setOpen(false);
  }

  function handleSelect(path: string) {
    setOpen(false);
    navigate(path);
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </Button>

      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
          onClick={handleOverlayClick}
        >
          <div className="mx-auto mt-16 w-full max-w-md px-4">
            <div className="rounded-xl border bg-popover text-popover-foreground shadow-xl ring-1 ring-foreground/10">
              <div className="p-3">
                <Input
                  ref={inputRef}
                  placeholder="Search groceries, recipes, pantry, library…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {query.trim() && (
                <div className="border-t pb-2">
                  {grouped.size === 0 ? (
                    <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                      No results found
                    </p>
                  ) : (
                    [...grouped.entries()].map(([category, items]) => (
                      <div key={category}>
                        <p className="px-3 pb-1 pt-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {category}
                        </p>
                        {items.map((item) => (
                          <button
                            key={item.id}
                            className="w-full px-3 py-1.5 text-left text-sm hover:bg-muted focus:bg-muted focus:outline-none"
                            onClick={() => handleSelect(item.path)}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
