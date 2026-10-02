import { createClient } from "@/lib/supabase/server";
import { ping } from "@/lib/data/health";

/**
 * Hit daily by the Vercel cron in vercel.json so the free-plan Supabase
 * project never sits idle long enough to pause. When CRON_SECRET is set in
 * Vercel, Vercel sends it as a bearer token and anything else is refused.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await ping(await createClient());
    return Response.json({ ok: true });
  } catch (e) {
    console.error("keepalive: ping failed", e);
    return Response.json({ ok: false }, { status: 503 });
  }
}
