import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "../auth.store";

export function useAuth() {
  const { setSession, setLoading } = useAuthStore();

  const sendMagicLink = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setLoading(false);
  }, [setSession, setLoading]);

  return { sendMagicLink, signOut };
}
