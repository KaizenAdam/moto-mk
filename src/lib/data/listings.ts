import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables, TablesInsert, TablesUpdate } from "@/lib/database.types";
import { getCurrentUser } from "@/lib/data/auth";

type Client = SupabaseClient<Database>;

/** Active listings only — what RLS would return anonymously anyway. */
export async function listActive(supabase: Client) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export type ListingFilters = {
  make?: string;
  ridingStyle?: string;
  engineType?: string;
  town?: string;
  priceMaxEur?: number;
  ccMax?: number;
  search?: string;
  sort?: "newest" | "price_low" | "price_high";
  /** 1-based page of BROWSE_PAGE_SIZE results. */
  page?: number;
};

export const BROWSE_PAGE_SIZE = 24;

/**
 * One page of active listings, narrowed by the browse page's filter bar,
 * plus the total matching count (for "N motorcycles found" and paging).
 */
export async function listActiveFiltered(supabase: Client, filters: ListingFilters) {
  let query = supabase.from("listings").select("*", { count: "exact" }).eq("status", "active");

  if (filters.make) query = query.eq("make", filters.make);
  if (filters.ridingStyle) query = query.eq("riding_style", filters.ridingStyle);
  if (filters.engineType) query = query.eq("engine_type", filters.engineType);
  if (filters.town) query = query.eq("town", filters.town);
  if (filters.priceMaxEur != null) query = query.lte("price_eur", filters.priceMaxEur);
  if (filters.ccMax != null) query = query.lte("engine_cc", filters.ccMax);
  if (filters.search) {
    // Strip characters that are meaningful in PostgREST's or()-filter syntax
    // (commas separate conditions, parens group, quotes wrap values) or in an ilike pattern
    // (% and _ are wildcards, * is PostgREST's alias for %, \ escapes), so a
    // raw search term is only ever matched as plain text. Nobody searches
    // for a bike by those characters.
    const term = filters.search.replace(/[,()"%_*\\]/g, " ").trim();
    if (term) {
      query = query.or(`title.ilike.%${term}%,make.ilike.%${term}%,model.ilike.%${term}%`);
    }
  }

  if (filters.sort === "price_low") query = query.order("price_eur", { ascending: true });
  else if (filters.sort === "price_high") query = query.order("price_eur", { ascending: false });
  else query = query.order("created_at", { ascending: false });
  // Tie-breaker so paging is stable when sort values are equal.
  query = query.order("id", { ascending: true });

  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const from = (page - 1) * BROWSE_PAGE_SIZE;
  query = query.range(from, from + BROWSE_PAGE_SIZE - 1);

  const { data, error, count } = await query;
  // Asking for a page past the end is a PostgREST "range not satisfiable" error, not an empty page.
  if (error?.code === "PGRST103") return { listings: [], total: count ?? 0 };
  if (error) throw error;
  return { listings: data, total: count ?? data.length };
}

/** One seller's live listings, newest first — a dealer storefront's stock. */
export async function listActiveBySeller(supabase: Client, sellerId: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Up to `limit` other live bikes like this one, for "Similar bikes" on a
 * listing page: same riding style if it has one, otherwise same make.
 */
export async function listSimilar(
  supabase: Client,
  listing: Pick<Tables<"listings">, "id" | "riding_style" | "make">,
  limit = 4
) {
  let query = supabase.from("listings").select("*").eq("status", "active").neq("id", listing.id);
  query = listing.riding_style
    ? query.eq("riding_style", listing.riding_style)
    : query.eq("make", listing.make);

  const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data;
}

/** The newest live bikes, for the home page. */
export async function listLatest(supabase: Client, limit = 8) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Per riding style: how many live bikes, and the newest one (whose cover
 * photo fronts the home page's "Browse by type" tile). Reads one narrow
 * row per live listing — fine at today's size; move to a grouped SQL view
 * or RPC once there are thousands.
 */
export async function listStyleShowcase(supabase: Client, styles: readonly string[]) {
  const { data, error } = await supabase
    .from("listings")
    .select("id, riding_style")
    .eq("status", "active")
    .in("riding_style", [...styles])
    .order("created_at", { ascending: false });

  if (error) throw error;

  const byStyle = new Map<string, { count: number; newestId: string | null }>(
    styles.map((s) => [s, { count: 0, newestId: null }])
  );
  for (const row of data) {
    const entry = row.riding_style ? byStyle.get(row.riding_style) : undefined;
    if (!entry) continue;
    entry.count += 1;
    entry.newestId ??= row.id;
  }
  return styles.map((style) => ({ style, ...byStyle.get(style)! }));
}

/** How many live listings each of these sellers has (missing = 0). */
export async function countActiveBySeller(supabase: Client, sellerIds: string[]) {
  const counts = new Map<string, number>();
  if (sellerIds.length === 0) return counts;

  const { data, error } = await supabase
    .from("listings")
    .select("seller_id")
    .eq("status", "active")
    .in("seller_id", sellerIds);

  if (error) throw error;
  for (const row of data) counts.set(row.seller_id, (counts.get(row.seller_id) ?? 0) + 1);
  return counts;
}

/** Distinct make/town values across active listings, to populate filter dropdowns from real data. */
export async function listFilterOptions(supabase: Client) {
  const { data, error } = await supabase
    .from("listings")
    .select("make, town")
    .eq("status", "active");

  if (error) throw error;

  const makes = Array.from(new Set(data.map((l) => l.make))).sort();
  const towns = Array.from(new Set(data.map((l) => l.town).filter((t): t is string => !!t))).sort();
  return { makes, towns };
}

/**
 * Every pending listing, for the admin review queue. RLS's listings_read
 * policy only surfaces these to a caller where private.is_admin() is true —
 * a non-admin calling this simply gets [] back, not an error.
 */
export async function listPendingForAdmin(supabase: Client) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

/** All listings owned by the current user, any status (including drafts). */
export async function listOwn(supabase: Client) {
  const user = await getCurrentUser(supabase);
  if (!user) return [];

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * RLS returns this only if the listing is active or owned by the caller.
 * A malformed id is "not found", not a Postgres uuid-syntax error.
 */
export async function getById(supabase: Client, id: string) {
  if (!UUID.test(id)) return null;

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function create(
  supabase: Client,
  listing: Omit<TablesInsert<"listings">, "seller_id" | "status">
) {
  const user = await getCurrentUser(supabase);
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("listings")
    .insert({ ...listing, seller_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data as Tables<"listings">;
}

export async function update(
  supabase: Client,
  id: string,
  updates: TablesUpdate<"listings">
) {
  const { data, error } = await supabase
    .from("listings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Tables<"listings">;
}

/**
 * Deletes a listing and its photo files. Files go first: Storage's delete
 * policy checks the caller owns the listing, which stops being checkable
 * once the row is gone — and the row's cascade only removes listing_photos
 * rows, never the files, so deleting the row first would orphan them.
 */
export async function remove(supabase: Client, id: string) {
  const { data: photos, error: photosError } = await supabase
    .from("listing_photos")
    .select("storage_path")
    .eq("listing_id", id);
  if (photosError) throw photosError;

  if (photos.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("listing-photos")
      .remove(photos.map((p) => p.storage_path));
    if (storageError) throw storageError;
  }

  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw error;
}
