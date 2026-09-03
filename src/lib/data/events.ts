import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables, TablesInsert } from "@/lib/database.types";
import { getCurrentUser } from "@/lib/data/auth";

type Client = SupabaseClient<Database>;

/** Public read — no draft/moderation lifecycle, just admin-authored content. */
export async function listEvents(supabase: Client) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data;
}

/**
 * Events happening today or later (or with no date set) — what the public
 * /events page shows. listEvents (admin) still returns everything,
 * including past events, since the portal is for managing all of them.
 */
export async function listUpcoming(supabase: Client) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .or(`event_date.gte.${today},event_date.is.null`)
    .order("event_date", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data;
}

/**
 * Only succeeds for an admin — enforced by the events_admin_insert RLS
 * policy via is_admin(), the same as every other admin-only write in this
 * app. created_by is set from the caller, not accepted as an input.
 */
export async function createEvent(
  supabase: Client,
  event: Omit<TablesInsert<"events">, "created_by">
) {
  const user = await getCurrentUser(supabase);
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("events")
    .insert({ ...event, created_by: user.id })
    .select()
    .single();

  if (error) throw error;
  return data as Tables<"events">;
}

export async function deleteEvent(supabase: Client, id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}
