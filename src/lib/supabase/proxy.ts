import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase session cookie on every request. This is an
 * optimistic check only (Next.js's own recommendation) — the real
 * authorization boundary is Postgres RLS, enforced in src/lib/data/*.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Triggers a token refresh if the session is stale, which fires
  // setAll above and rewrites the response cookies. A failure here (Supabase
  // unreachable) must not fail the request: the page renders, and its own
  // error boundary handles any data it can't load.
  try {
    await supabase.auth.getUser();
  } catch (e) {
    console.error("proxy: session refresh failed", e);
  }

  return response;
}
