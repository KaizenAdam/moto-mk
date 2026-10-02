import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type Client = SupabaseClient<Database>;

/**
 * Cheapest possible real query. The free Supabase plan pauses a project
 * after a week without API traffic, which takes the whole site down — the
 * daily keep-alive cron calls this so there's always some.
 */
export async function ping(supabase: Client) {
  const { error } = await supabase.from("events").select("id").limit(1);
  if (error) throw error;
}
