import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/auth.store";
import { useLibraryStore } from "../library.store";
import { libraryService } from "../services/library.service";
import type { LibraryItem } from "@/types";
import type { LibraryItemFields } from "../library.store";
import type { GroceryItemFormValues } from "@/lib/zod-schemas";

const isDemo = !import.meta.env.VITE_SUPABASE_URL;

export function useLibrarySync() {
  const user = useAuthStore((state) => state.user);
  const {
    items,
    setItems,
    createItem,
    updateItem,
    removeItem,
    restoreItem,
    toggleFavorite: toggleFavoriteStore,
    saveFromForm: saveFromFormStore,
  } = useLibraryStore();

  useEffect(() => {
    if (isDemo || !user) return;

    let cancelled = false;

    const load = () => {
      libraryService.fetchItems(user.id).then((fetched) => {
        if (!cancelled) setItems(fetched);
      });
    };

    load();

    const onFocus = () => load();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [user, setItems]);

  // Merge a Supabase-returned item into the local store without a full refetch.
  // Matches by id first, then by name (for upserts where the id may differ).
  const upsertIntoStore = (item: LibraryItem, matchName?: string) => {
    const cur = useLibraryStore.getState().items;
    const matchLower = (matchName ?? item.name).toLowerCase();
    const idx = cur.findIndex(
      (i) => i.id === item.id || i.name.toLowerCase() === matchLower,
    );
    setItems(
      idx >= 0
        ? cur.map((i) => (i.id === cur[idx].id ? item : i))
        : [item, ...cur],
    );
  };

  const handleCreateItem = async (fields: LibraryItemFields) => {
    if (isDemo || !user) {
      createItem(fields);
      return;
    }
    const item = await libraryService.upsertItem({
      name: fields.name,
      unit: fields.unit ?? "",
      estimated_price: fields.estimated_price ?? null,
      store: fields.store ?? null,
      notes: fields.notes ?? null,
      is_favorite: false,
      times_added: 1,
      last_added: new Date().toISOString(),
      user_id: user.id,
    });
    upsertIntoStore(item);
    return item;
  };

  const handleUpdateItem = async (
    id: string,
    changes: Partial<LibraryItem>,
  ) => {
    if (isDemo || !user) {
      updateItem(id, changes);
      return;
    }
    const updated = await libraryService.updateItem(id, changes);
    updateItem(id, updated);
    return updated;
  };

  const handleRemoveItem = async (id: string) => {
    if (isDemo || !user) {
      removeItem(id);
      return;
    }
    await libraryService.deleteItem(id);
    removeItem(id);
  };

  const handleRestoreItem = async (item: LibraryItem) => {
    if (isDemo || !user) {
      restoreItem(item);
      return;
    }
    const restored = await libraryService.upsertItem({
      ...item,
      user_id: user.id,
    });
    upsertIntoStore(restored);
    return restored;
  };

  const handleToggleFavorite = async (id: string) => {
    if (isDemo || !user) {
      toggleFavoriteStore(id);
      return;
    }
    // Read from store at call time (not stale closure) to get current is_favorite
    const current = useLibraryStore.getState().items.find((i) => i.id === id);
    if (!current) return;
    const updated = await libraryService.toggleFavorite(
      id,
      !current.is_favorite,
    );
    updateItem(id, updated);
    return updated;
  };

  const saveFromForm = async (values: GroceryItemFormValues) => {
    if (isDemo || !user) {
      saveFromFormStore(values);
      return;
    }
    const item = await libraryService.upsertItem({
      name: values.name,
      unit: values.unit ?? "",
      estimated_price: values.estimated_price ?? null,
      store: values.store ?? null,
      notes: values.notes ?? null,
      is_favorite: false,
      times_added: 1,
      last_added: new Date().toISOString(),
      user_id: user.id,
    });
    upsertIntoStore(item, values.name);
  };

  return {
    items,
    createItem: handleCreateItem,
    updateItem: handleUpdateItem,
    removeItem: handleRemoveItem,
    restoreItem: handleRestoreItem,
    toggleFavorite: handleToggleFavorite,
    saveFromForm,
  };
}
