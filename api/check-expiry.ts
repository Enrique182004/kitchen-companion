export const config = { runtime: "nodejs" };

// TODO: Implement expiry check cron job
// 1. Query Supabase for pantry items expiring within 3 days
//    using SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY env vars
// 2. Group affected items by user_id
// 3. For each user, fetch their push subscription from a
//    push_subscriptions table (to be created in Supabase)
// 4. Send a push notification via web-push with VAPID_PUBLIC_KEY
//    and VAPID_PRIVATE_KEY env vars
// 5. Configure as a Vercel cron job in vercel.json:
//    { "crons": [{ "path": "/api/check-expiry", "schedule": "0 9 * * *" }] }

export default async function handler(_req: Request): Promise<Response> {
  return new Response(JSON.stringify({ message: "Not yet implemented" }), {
    status: 501,
    headers: { "Content-Type": "application/json" },
  });
}
