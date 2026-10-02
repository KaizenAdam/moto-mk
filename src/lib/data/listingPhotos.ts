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

export const MAX_PHOTOS = 10;

/**
 * Uploads already-compressed images for a listing the caller owns, then
 * records them. Runs in the browser (a server action can't take 10 photos —
 * its request body is capped at 1 MB), through the same Storage RLS as
 * everything else: the bucket only accepts writes under a listing the
 * caller owns. Rows are added after their files, so a failed upload never
 * leaves a row pointing at nothing.
 */
export async function addPhotos(
  supabase: Client,
  listingId: string,
  images: Blob[],
  firstSortOrder = 0
) {
  const rows: { listing_id: string; storage_path: string; sort_order: number }[] = [];
  for (const [i, image] of images.entries()) {
    const path = `${listingId}/${crypto.randomUUID()}.jpg`;
    const { error } = await supabase.storage
      .from("listing-photos")
      .upload(path, image, { contentType: "image/jpeg" });
    if (error) throw error;
    rows.push({ listing_id: listingId, storage_path: path, sort_order: firstSortOrder + i });
  }
  if (rows.length === 0) return;

  const { error } = await supabase.from("listing_photos").insert(rows);
  if (error) throw error;
}

/** Removes one photo: file first, then its row (Storage RLS checks the listing). */
export async function removePhoto(
  supabase: Client,
  photo: { id: string; storage_path: string }
) {
  const { error: storageError } = await supabase.storage
    .from("listing-photos")
    .remove([photo.storage_path]);
  if (storageError) throw storageError;

  const { error } = await supabase.from("listing_photos").delete().eq("id", photo.id);
  if (error) throw error;
}
