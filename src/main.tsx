import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/features/auth/auth.store";
import { App } from "./App";
import "./index.css";

function Root() {
  const { setSession, setLoading } = useAuthStore();

  useEffect(() => {
    if (!import.meta.env.VITE_SUPABASE_URL) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setSession, setLoading]);

  return (
    <BrowserRouter>
      <App />
      <Toaster />
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
