import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { getCurrentUser } from "@/lib/data/auth";

type Client = SupabaseClient<Database>;

export async function listSaved(supabase: Client) {
  const user = await getCurrentUser(supabase);
  if (!user) return [];

  const { data, error } = await supabase
    .from("saved_listings")
    .select("*, listings(*)")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function save(supabase: Client, listingId: string) {
  const user = await getCurrentUser(supabase);
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("saved_listings")
    .insert({ profile_id: user.id, listing_id: listingId });

  if (error) throw error;
}

export async function unsave(supabase: Client, listingId: string) {
  const user = await getCurrentUser(supabase);
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("saved_listings")
    .delete()
    .eq("profile_id", user.id)
    .eq("listing_id", listingId);

  if (error) throw error;
}
