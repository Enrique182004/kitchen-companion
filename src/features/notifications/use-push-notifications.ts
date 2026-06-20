import { useState, useEffect } from "react";

const VAPID_PUBLIC_KEY =
  "BFbD6kyueXucUlStiOdZ9cGQIE3w8InGHqeQAcR5m3Qh5k44n6bDFDCd7hPDZKxwrIfV5BhtRJgR5u9-lKQJAcM";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0))).buffer;
}

export function usePushNotifications() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(
      "Notification" in window &&
        "serviceWorker" in navigator &&
        "PushManager" in window,
    );
    if ("Notification" in window) setPermission(Notification.permission);
  }, []);

  const subscribe = async (): Promise<PushSubscription | null> => {
    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm !== "granted") return null;

    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    setSubscription(sub);
    return sub;
  };

  const unsubscribe = async (): Promise<void> => {
    await subscription?.unsubscribe();
    setSubscription(null);
  };

  return { permission, subscription, supported, subscribe, unsubscribe };
}
