import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TablesUpdate } from "@/lib/database.types";
import { getCurrentUser } from "@/lib/data/auth";

type Client = SupabaseClient<Database>;

/**
 * Dealer storefronts. Rows are created by approving a dealer request (a DB
 * trigger), never from here. RLS shows anyone the active ones; a dealer
 * also sees their own when it's switched off.
 */

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Every live storefront, for the directory and for badging dealer listings. */
export async function listActiveDealers(supabase: Client) {
  const { data, error } = await supabase
    .from("dealers")
    .select("*")
    .eq("active", true)
    .order("business_name");

  if (error) throw error;
  return data;
}

export async function getBySlug(supabase: Client, slug: string) {
  if (!SLUG.test(slug)) return null;
  const { data, error } = await supabase
    .from("dealers")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** The live storefront of a given seller, if they are a dealer. */
export async function getActiveBySeller(supabase: Client, profileId: string) {
  const { data, error } = await supabase
    .from("dealers")
    .select("*")
    .eq("profile_id", profileId)
    .eq("active", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getOwnDealer(supabase: Client) {
  const user = await getCurrentUser(supabase);
  if (!user) return null;
  const { data, error } = await supabase
    .from("dealers")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Column grants limit this to business_name, town, address, phone, about. */
export async function updateOwnDealer(
  supabase: Client,
  updates: Pick<TablesUpdate<"dealers">, "business_name" | "town" | "address" | "phone" | "about">
) {
  const user = await getCurrentUser(supabase);
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("dealers").update(updates).eq("profile_id", user.id);
  if (error) throw error;
}
