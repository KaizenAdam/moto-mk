import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables, TablesUpdate } from "@/lib/database.types";
import { getCurrentUser } from "@/lib/data/auth";

type Client = SupabaseClient<Database>;

export async function getOwnProfile(supabase: Client) {
  const user = await getCurrentUser(supabase);
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function getPublicProfile(supabase: Client, id: string) {
  const { data, error } = await supabase
    .from("public_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Every profile, full columns (including phone) — for the admin portal's
 * user roster. Relies on the profiles_select policy's OR private.is_admin()
 * arm; a non-admin caller gets back only their own row, never an error.
 */
export async function listAllForAdmin(supabase: Client) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateOwnProfile(
  supabase: Client,
  updates: TablesUpdate<"profiles">
) {
  const user = await getCurrentUser(supabase);
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data as Tables<"profiles">;
}

/**
 * The seller's name and phone for one listing, via the get_seller_contact
 * RPC — the only way a phone number leaves `profiles`. Returns null when
 * signed out, when the listing isn't visible to the caller, or when the
 * seller hasn't given a phone.
 */
export async function getSellerContact(supabase: Client, listingId: string) {
  // The RPC isn't executable by anon at all — calling it signed out is a
  // permission error, not an empty result. Don't ask.
  const user = await getCurrentUser(supabase);
  if (!user) return null;

  const { data, error } = await supabase.rpc("get_seller_contact", { p_listing_id: listingId });
  if (error) throw error;
  const row = data?.[0];
  return row?.phone ? { name: row.name, phone: row.phone } : null;
}
