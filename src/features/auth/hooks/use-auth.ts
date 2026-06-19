import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "../auth.store";
import type { LoginFormValues, SignupFormValues } from "@/lib/zod-schemas";

export function useAuth() {
  const { setSession, setLoading } = useAuthStore();

  const signIn = useCallback(async ({ email, password }: LoginFormValues) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async ({ email, password }: SignupFormValues) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/grocery` },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setLoading(false);
  }, [setSession, setLoading]);

  return { signIn, signUp, signInWithGoogle, signOut };
}
