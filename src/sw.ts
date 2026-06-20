/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("push", (event) => {
  const data =
    (event.data?.json() as {
      title?: string;
      body?: string;
      tag?: string;
      url?: string;
    }) ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Kitchen Companion", {
      body: data.body ?? "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: data.tag ?? "kitchen-companion",
      data: { url: data.url ?? "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(
      (event.notification.data as { url: string } | undefined)?.url ?? "/",
    ),
  );
});
