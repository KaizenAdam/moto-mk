import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type Client = SupabaseClient<Database>;

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour — plenty for a single page render

/**
 * Turns storage paths into URLs, one result per path, in order (null where
 * a path couldn't be signed). The default signs with the caller's own
 * client: correct for every visibility rule, but a fresh URL each time, so
 * browsers can't cache the image. Pages pass a caching signer for
 * public photos instead — see src/lib/photos/signer.ts.
 */
export type PhotoSigner = (paths: string[]) => Promise<(string | null)[]>;

export function signWith(supabase: Client): PhotoSigner {
  return async (paths) => {
    if (paths.length === 0) return [];
    const { data, error } = await supabase.storage
      .from("listing-photos")
      .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
    if (error) throw error;
    return paths.map((_, i) => data[i]?.signedUrl ?? null);
  };
}

/**
 * RLS mirrors listings visibility: active-or-owner-or-admin. The bucket is
 * private, so each row's storage_path is exchanged for a signed URL (one
 * batched call) rather than a plain public URL.
 */
export async function listForListing(
  supabase: Client,
  listingId: string,
  sign: PhotoSigner = signWith(supabase)
) {
  const { data, error } = await supabase
    .from("listing_photos")
    .select("*")
    .eq("listing_id", listingId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  if (data.length === 0) return [];

  const urls = await sign(data.map((p) => p.storage_path));
  return data.map((photo, i) => ({ ...photo, url: urls[i] }));
}

/**
 * The lowest-sort_order photo per listing, plus how many photos each has,
 * for a grid of cards. One query plus one signing pass, not N round trips.
 * Listings with no photos are missing from the map.
 */
export async function getCoverPhotos(
  supabase: Client,
  listingIds: string[],
  sign: PhotoSigner = signWith(supabase)
) {
  const covers = new Map<string, { url: string | null; count: number }>();
  if (listingIds.length === 0) return covers;

  const { data, error } = await supabase
    .from("listing_photos")
    .select("listing_id, storage_path, sort_order")
    .in("listing_id", listingIds)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  const coverByListing = new Map<string, string>();
  const counts = new Map<string, number>();
  for (const row of data) {
    if (!coverByListing.has(row.listing_id)) coverByListing.set(row.listing_id, row.storage_path);
    counts.set(row.listing_id, (counts.get(row.listing_id) ?? 0) + 1);
  }
  if (coverByListing.size === 0) return covers;

  const paths = [...coverByListing.values()];
  const signed = await sign(paths);
  const urlByPath = new Map(paths.map((path, i) => [path, signed[i]]));
  for (const [listingId, path] of coverByListing) {
    covers.set(listingId, { url: urlByPath.get(path) ?? null, count: counts.get(listingId) ?? 0 });
  }
  return covers;
}

/** Just the cover URLs (see getCoverPhotos). */
export async function getCoverPhotoUrls(
  supabase: Client,
  listingIds: string[],
  sign: PhotoSigner = signWith(supabase)
) {
  const urls = new Map<string, string>();
  for (const [id, cover] of await getCoverPhotos(supabase, listingIds, sign)) {
    if (cover.url) urls.set(id, cover.url);
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
