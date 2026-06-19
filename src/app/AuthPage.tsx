import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { SignupForm } from "@/features/auth/components/SignupForm";
import { GoogleButton } from "@/features/auth/components/GoogleButton";

export function AuthPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Kitchen Companion</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your kitchen, effortlessly.
        </p>
      </div>
      <GoogleButton />
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>
      <Tabs defaultValue="login">
        <TabsList className="w-full">
          <TabsTrigger value="login" className="flex-1">
            Sign In
          </TabsTrigger>
          <TabsTrigger value="signup" className="flex-1">
            Sign Up
          </TabsTrigger>
        </TabsList>
        <TabsContent value="login" className="mt-4">
          <LoginForm />
        </TabsContent>
        <TabsContent value="signup" className="mt-4">
          <SignupForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
