import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/hooks/use-auth";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

const otpSchema = z.object({
  token: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d+$/, "Digits only"),
});

type EmailValues = z.infer<typeof emailSchema>;
type OtpValues = z.infer<typeof otpSchema>;

export function AuthPage() {
  const { sendOtp, verifyOtp } = useAuth();
  const [email, setEmail] = useState<string | null>(null);

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
  });

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
  });

  const onSendOtp = async ({ email: e }: EmailValues) => {
    try {
      await sendOtp(e);
      setEmail(e);
      otpForm.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send code");
    }
  };

  const onVerifyOtp = async ({ token }: OtpValues) => {
    if (!email) return;
    try {
      await verifyOtp(email, token);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Invalid code — try again",
      );
      otpForm.reset();
    }
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Kitchen Companion</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your kitchen, effortlessly.
        </p>
      </div>

      {!email ? (
        <form
          onSubmit={emailForm.handleSubmit(onSendOtp)}
          className="space-y-4"
        >
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...emailForm.register("email")}
            />
            {emailForm.formState.errors.email && (
              <p className="text-xs text-destructive">
                {emailForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={emailForm.formState.isSubmitting}
          >
            {emailForm.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Send code
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
          </p>
          <form
            onSubmit={otpForm.handleSubmit(onVerifyOtp)}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="token">Verification code</Label>
              <Input
                id="token"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                autoFocus
                autoComplete="one-time-code"
                {...otpForm.register("token")}
              />
              {otpForm.formState.errors.token && (
                <p className="text-xs text-destructive">
                  {otpForm.formState.errors.token.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={otpForm.formState.isSubmitting}
            >
              {otpForm.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Verify
            </Button>
          </form>
          <button
            type="button"
            onClick={() => setEmail(null)}
            className="flex w-full items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Use a different email
          </button>
        </div>
      )}
    </div>
  );
}
