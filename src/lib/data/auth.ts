import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type Client = SupabaseClient<Database>;

/**
 * `auth.getUser()` is a real network round-trip (it revalidates the JWT
 * against Supabase Auth, unlike the cookie-only getSession()) — that's why
 * it's used everywhere in this data layer instead of getSession(). Multiple
 * data-access calls in the same page render each asking "who's logged in"
 * used to mean multiple redundant round-trips for the same answer.
 * `cache()` collapses those into one per request, keyed by the `supabase`
 * client instance every page already creates once and threads through.
 */
export const getCurrentUser = cache(async (supabase: Client) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
