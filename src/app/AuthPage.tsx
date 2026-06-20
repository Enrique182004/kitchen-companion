import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useAuthStore } from "@/features/auth/auth.store";
import { supabase } from "@/lib/supabase";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const { setSession } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email, password }: FormValues) => {
    try {
      if (tab === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      // Manually sync session in case onAuthStateChange is slow
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setSession(data.session);
        navigate("/grocery", { replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    }
  };

  const switchTab = (next: "signin" | "signup") => {
    setTab(next);
    reset();
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Kitchen Companion</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your kitchen, effortlessly.
        </p>
      </div>

      <div className="flex rounded-lg border p-1">
        <button
          type="button"
          onClick={() => switchTab("signin")}
          className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
            tab === "signin"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => switchTab("signup")}
          className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
            tab === "signup"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Create account
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete={
              tab === "signin" ? "current-password" : "new-password"
            }
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {tab === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
