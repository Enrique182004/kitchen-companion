import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/features/auth/auth.store";
import type { Category } from "@/types";

const DEFAULT_CATEGORIES = [
  "Produce",
  "Dairy",
  "Meat",
  "Seafood",
  "Frozen",
  "Bakery",
  "Pantry",
  "Drinks",
  "Snacks",
  "Household",
  "Other",
];

export function useCategories() {
  const user = useAuthStore((state) => state.user);
  // Only track by ID so a new session object with the same user doesn't re-trigger the load
  const userId = user?.id ?? null;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const seedingRef = useRef(false); // prevent concurrent seeding attempts

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId)
        .order("name");

      if (cancelled) return;

      if (error) {
        setLoading(false);
        return;
      }

      if (data.length === 0 && !seedingRef.current) {
        seedingRef.current = true;
        const defaults = DEFAULT_CATEGORIES.map((name) => ({
          user_id: userId,
          name,
          is_default: true,
        }));
        const { data: seeded } = await supabase
          .from("categories")
          .upsert(defaults, {
            onConflict: "user_id,name",
            ignoreDuplicates: true,
          })
          .select("*");
        if (!cancelled) {
          setCategories(seeded ?? []);
          setLoading(false);
        }
      } else {
        setCategories(data);
        setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [userId]); // use userId string, not user object — avoids re-running on same-user session refresh

  const addCategory = async (name: string) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("categories")
      .insert({ user_id: userId, name, is_default: false })
      .select("*")
      .single();
    if (!error && data) setCategories((prev) => [...prev, data]);
  };

  return { categories, loading, addCategory };
}
