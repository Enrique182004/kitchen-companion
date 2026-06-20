import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "../auth.store";

export function useAuth() {
  const { setSession, setLoading } = useAuthStore();

  const sendOtp = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) throw error;
  }, []);

  const verifyOtp = useCallback(async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setLoading(false);
  }, [setSession, setLoading]);

  return { sendOtp, verifyOtp, signOut };
}
