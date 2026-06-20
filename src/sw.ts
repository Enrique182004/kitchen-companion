/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";

declare const self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Navigation requests: NetworkFirst so users get fresh HTML but fall back to cache offline
registerRoute(
  new NavigationRoute(new NetworkFirst({ cacheName: "navigation" })),
);

// Static assets (JS, CSS, fonts, images): StaleWhileRevalidate for instant loads + background refresh
registerRoute(
  ({ request }) =>
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font" ||
    request.destination === "image",
  new StaleWhileRevalidate({ cacheName: "static-assets" }),
);

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
