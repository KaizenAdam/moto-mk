import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type Client = SupabaseClient<Database>;

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour — plenty for a single page render

/**
 * RLS mirrors listings visibility: active-or-owner-or-admin. The bucket is
 * private, so each row's storage_path is exchanged for a signed URL (one
 * batched call) rather than a plain public URL.
 */
export async function listForListing(supabase: Client, listingId: string) {
  const { data, error } = await supabase
    .from("listing_photos")
    .select("*")
    .eq("listing_id", listingId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  if (data.length === 0) return [];

  const { data: signed, error: signError } = await supabase.storage
    .from("listing-photos")
    .createSignedUrls(
      data.map((p) => p.storage_path),
      SIGNED_URL_TTL_SECONDS
    );
  if (signError) throw signError;

  return data.map((photo, i) => ({ ...photo, url: signed[i]?.signedUrl ?? null }));
}

/**
 * The lowest-sort_order photo per listing, for a grid of cards. One query
 * plus one batched createSignedUrls call, not N round trips.
 */
export async function getCoverPhotoUrls(supabase: Client, listingIds: string[]) {
  const urls = new Map<string, string>();
  if (listingIds.length === 0) return urls;

  const { data, error } = await supabase
    .from("listing_photos")
    .select("listing_id, storage_path, sort_order")
    .in("listing_id", listingIds)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  const coverByListing = new Map<string, string>();
  for (const row of data) {
    if (!coverByListing.has(row.listing_id)) coverByListing.set(row.listing_id, row.storage_path);
  }
  if (coverByListing.size === 0) return urls;

  const paths = [...coverByListing.values()];
  const { data: signed, error: signError } = await supabase.storage
    .from("listing-photos")
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  if (signError) throw signError;

  const urlByPath = new Map(paths.map((path, i) => [path, signed[i]?.signedUrl]));
  for (const [listingId, path] of coverByListing) {
    const url = urlByPath.get(path);
    if (url) urls.set(listingId, url);
  }
  return urls;
}
