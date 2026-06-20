import webpush from "web-push";

export const config = { runtime: "nodejs" };

interface NotificationPayload {
  subscription: webpush.PushSubscription;
  title: string;
  body: string;
  url?: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

  if (!vapidPublicKey || !vapidPrivateKey) {
    return new Response("VAPID keys not configured", { status: 500 });
  }

  webpush.setVapidDetails(
    "mailto:ecalleros4@miners.utep.edu",
    vapidPublicKey,
    vapidPrivateKey,
  );

  let body: NotificationPayload;
  try {
    body = (await req.json()) as NotificationPayload;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { subscription, title, body: notifBody, url } = body;

  if (!subscription || !title) {
    return new Response("Missing required fields", { status: 400 });
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body: notifBody, url: url ?? "/" }),
    );
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
