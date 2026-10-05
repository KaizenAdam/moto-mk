import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type Client = SupabaseClient<Database>;

/**
 * Who's signed in, as `{ id }` — the only field anything here uses.
 *
 * Uses `getClaims()`, which verifies the session JWT's signature locally
 * against the project's published signing keys (cached), instead of
 * `getUser()`, which is a network round trip to Supabase Auth on every
 * call. Never `getSession()`: it reads the cookie without verifying it.
 * (If the project still signs with a legacy shared secret, getClaims falls
 * back to a getUser round trip by itself — correct either way, just not
 * faster.) This only decides what to *show*; Postgres RLS re-checks the
 * JWT on every query, and that is the real authorization boundary.
 *
 * `cache()` collapses repeat calls within one request render into one,
 * keyed by the `supabase` client instance every page creates once.
 */
export const getCurrentUser = cache(async (supabase: Client) => {
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  return id ? { id } : null;
});
