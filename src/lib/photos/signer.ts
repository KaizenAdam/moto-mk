import "server-only";
import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { signWith, type PhotoSigner } from "@/lib/data/listingPhotos";

/**
 * Photo URLs that stay the same for a while, so browsers can cache the
 * images. A signed URL embeds its own timestamp, so signing on every
 * request gave every page view brand-new URLs and every photo was
 * downloaded again on every visit.
 *
 * Only *public* photos are cached: they're signed as a signed-out visitor
 * (a cookie-less anon client), and Storage RLS lets anon sign only photos of
 * active listings. Anything else — a seller's pending listing, what an admin
 * reviews — fails here and falls back to a fresh per-request URL signed as
 * the actual viewer. A cached URL is re-made every 50 minutes and valid for
 * 2 hours, so a listing taken down keeps a working photo URL for at most
 * ~2 hours (same as before for anyone who'd already loaded it).
 *
 * unstable_cache: Next 16 recommends `use cache`, which needs the Cache
 * Components flag and reworks every page's caching. Swap when that's done.
 */
const URL_TTL_SECONDS = 2 * 60 * 60;
const REUSE_SECONDS = 50 * 60;

let anon: SupabaseClient<Database> | null = null;
function anonClient() {
  anon ??= createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  return anon;
}

const signPublic = unstable_cache(
  async (path: string) => {
    const { data, error } = await anonClient()
      .storage.from("listing-photos")
      .createSignedUrl(path, URL_TTL_SECONDS);
    // Throw rather than return null: a thrown result isn't cached, so a photo
    // that isn't public yet will be retried once its listing goes live.
    if (error || !data?.signedUrl) throw error ?? new Error("not signable");
    return data.signedUrl;
  },
  ["listing-photo-url"],
  { revalidate: REUSE_SECONDS, tags: ["listing-photo-urls"] }
);

/** Cached URLs for public photos; anything private is signed fresh as the viewer. */
export function cachedPhotoSigner(viewer: SupabaseClient<Database>): PhotoSigner {
  return async (paths) => {
    const cached = await Promise.all(paths.map((p) => signPublic(p).catch(() => null)));
    const missing = paths.filter((_, i) => cached[i] == null);
    if (missing.length === 0) return cached;

    const fresh = await signWith(viewer)(missing);
    const freshByPath = new Map(missing.map((p, i) => [p, fresh[i]]));
    return paths.map((p, i) => cached[i] ?? freshByPath.get(p) ?? null);
  };
}
