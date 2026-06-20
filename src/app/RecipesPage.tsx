import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, BookOpen, Clock, Users, Star, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRecipeSync } from "@/features/recipe/hooks/use-recipe-sync";
import { RecipeForm } from "@/features/recipe/components/RecipeForm";
import { RecipeDetailSheet } from "@/features/recipe/components/RecipeDetailSheet";
import {
  ImportRecipeDialog,
  type ImportedRecipe,
} from "@/features/recipe/components/ImportRecipeDialog";
import type { Recipe } from "@/types";
import type { RecipeFormValues } from "@/features/recipe/recipe.store";

function RecipeCard({
  recipe,
  onView,
  onToggleFavorite,
}: {
  recipe: Recipe;
  onView: (r: Recipe) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const totalMins =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);
  return (
    <div className="rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-2 p-4">
        <button
          onClick={() => onView(recipe)}
          className="min-w-0 flex-1 text-left"
          aria-label={`View ${recipe.title}`}
        >
          <p className="truncate font-semibold">{recipe.title}</p>
          {recipe.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
              {recipe.description}
            </p>
          )}
        </button>
        <button
          onClick={() => onToggleFavorite(recipe.id)}
          aria-label={recipe.is_favorite ? "Unfavorite" : "Favorite"}
          className="shrink-0 p-0.5 text-muted-foreground hover:text-yellow-400"
        >
          <Star
            className={`h-4 w-4 ${recipe.is_favorite ? "fill-yellow-400 text-yellow-400" : ""}`}
          />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 pb-3 text-xs text-muted-foreground">
        {recipe.servings && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {recipe.servings} servings
          </span>
        )}
        {totalMins > 0 && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {totalMins} min
          </span>
        )}
        {recipe.ingredients.length > 0 && (
          <span>{recipe.ingredients.length} ingredients</span>
        )}
      </div>

      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 px-4 pb-4">
          {recipe.tags.map((t) => (
            <Badge key={t} variant="secondary" className="text-xs">
              {t}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function RecipesPage() {
  const [search, setSearch] = useState("");
  const [favOnly, setFavOnly] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [viewing, setViewing] = useState<Recipe | null>(null);
  const [importDefaults, setImportDefaults] = useState<
    Partial<RecipeFormValues> | undefined
  >(undefined);

  const {
    recipes,
    createRecipe,
    updateRecipe,
    removeRecipe,
    restoreRecipe,
    toggleFavorite,
  } = useRecipeSync();

  // Auto-reset favOnly when the last favorite is un-favorited
  useEffect(() => {
    if (favOnly && !recipes.some((r) => r.is_favorite)) {
      setFavOnly(false);
    }
  }, [recipes, favOnly]);

  const filtered = useMemo(() => {
    let r = recipes;
    if (favOnly) r = r.filter((x) => x.is_favorite);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (x) =>
          x.title.toLowerCase().includes(q) ||
          x.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return [...r].sort((a, b) => {
      if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [recipes, search, favOnly]);

  const handleSubmit = (values: RecipeFormValues) => {
    if (editing) {
      updateRecipe(editing.id, values);
      setEditing(null);
    } else {
      createRecipe(values);
    }
  };

  const handleImport = (data: ImportedRecipe) => {
    setImportOpen(false);
    setImportDefaults({
      title: data.title,
      description: data.description,
      servings: data.servings,
      prep_time_minutes: data.prep_time_minutes,
      cook_time_minutes: data.cook_time_minutes,
      tags: "",
      ingredients: data.ingredients.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
      })),
      instructions: data.instructions.map((t) => ({ text: t })),
    });
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (recipe: Recipe) => {
    setDetailOpen(false);
    setEditing(recipe);
    setImportDefaults(undefined);
    setFormOpen(true);
  };

  const openView = (recipe: Recipe) => {
    setViewing(recipe);
    setDetailOpen(true);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 pb-24 md:pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recipes</h1>
          <p className="text-sm text-muted-foreground">
            {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setImportOpen(true)}
          >
            <Link className="mr-1 h-4 w-4" />
            Import URL
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setImportDefaults(undefined);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            New Recipe
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes or tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        {recipes.some((r) => r.is_favorite) && (
          <button
            onClick={() => setFavOnly((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors ${
              favOnly
                ? "border-yellow-400 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Star
              className={`h-3.5 w-3.5 ${favOnly ? "fill-yellow-400 text-yellow-400" : ""}`}
            />
            Favorites
          </button>
        )}
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-medium">No recipes yet</p>
            <p className="text-sm text-muted-foreground">
              Create a recipe and add its ingredients straight to your grocery
              list.
            </p>
          </div>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Create First Recipe
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          {favOnly
            ? "No favorite recipes yet."
            : "No recipes match your search."}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              onView={openView}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}

      <ImportRecipeDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />

      <RecipeForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
          setImportDefaults(undefined);
        }}
        onSubmit={handleSubmit}
        defaultValues={editing ?? (importDefaults as Recipe | undefined)}
        title={editing ? "Edit Recipe" : "New Recipe"}
      />

      <RecipeDetailSheet
        recipe={viewing}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={openEdit}
        onDelete={(id) => {
          const recipe = recipes.find((r) => r.id === id);
          removeRecipe(id);
          setDetailOpen(false);
          if (recipe) {
            toast(`Deleted "${recipe.title}"`, {
              action: { label: "Undo", onClick: () => restoreRecipe(recipe) },
              duration: 4000,
            });
          }
        }}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
}
