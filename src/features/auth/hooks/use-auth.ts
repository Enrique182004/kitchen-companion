import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "../auth.store";

export function useAuth() {
  const { setSession, setLoading } = useAuthStore();

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setLoading(false);
  }, [setSession, setLoading]);

  return { signIn, signUp, signOut };
}
