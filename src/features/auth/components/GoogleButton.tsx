import { Button } from "@/components/ui/button";
import { useAuth } from "../hooks/use-auth";

export function GoogleButton() {
  const { signInWithGoogle } = useAuth();
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={signInWithGoogle}
      type="button"
    >
      Continue with Google
    </Button>
  );
}
