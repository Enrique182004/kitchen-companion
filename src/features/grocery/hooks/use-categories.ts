import { useEffect, useState } from "react";
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user!.id)
        .order("name");

      if (error) {
        setLoading(false);
        return;
      }

      if (data.length === 0) {
        const defaults = DEFAULT_CATEGORIES.map((name) => ({
          user_id: user!.id,
          name,
          is_default: true,
        }));
        const { data: seeded } = await supabase
          .from("categories")
          .insert(defaults)
          .select("*");
        setCategories(seeded ?? []);
      } else {
        setCategories(data);
      }

      setLoading(false);
    }

    load();
  }, [user]);

  const addCategory = async (name: string) => {
    const { data, error } = await supabase
      .from("categories")
      .insert({ user_id: user!.id, name, is_default: false })
      .select("*")
      .single();
    if (!error && data) setCategories((prev) => [...prev, data]);
  };

  return { categories, loading, addCategory };
}
