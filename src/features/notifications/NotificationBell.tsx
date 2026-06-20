import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "./use-push-notifications";

export function NotificationBell() {
  const { permission, supported, subscribe, subscription } =
    usePushNotifications();

  if (!supported) return null;

  const isActive = permission === "granted" && !!subscription;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={subscribe}
      aria-label={isActive ? "Notifications enabled" : "Enable notifications"}
      title={isActive ? "Notifications on" : "Enable expiry notifications"}
    >
      {isActive ? (
        <Bell className="h-4 w-4" />
      ) : (
        <BellOff className="h-4 w-4" />
      )}
    </Button>
  );
}
