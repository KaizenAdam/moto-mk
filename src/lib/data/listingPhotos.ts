import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type Client = SupabaseClient<Database>;

/** RLS mirrors listings visibility: active-or-owner-or-admin. */
export async function listForListing(supabase: Client, listingId: string) {
  const { data, error } = await supabase
    .from("listing_photos")
    .select("*")
    .eq("listing_id", listingId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}
