import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables, TablesInsert, TablesUpdate } from "@/lib/database.types";

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
};

/** Active listings, narrowed by the browse page's filter bar. */
export async function listActiveFiltered(supabase: Client, filters: ListingFilters) {
  let query = supabase.from("listings").select("*").eq("status", "active");

  if (filters.make) query = query.eq("make", filters.make);
  if (filters.ridingStyle) query = query.eq("riding_style", filters.ridingStyle);
  if (filters.engineType) query = query.eq("engine_type", filters.engineType);
  if (filters.town) query = query.eq("town", filters.town);
  if (filters.priceMaxEur != null) query = query.lte("price_eur", filters.priceMaxEur);
  if (filters.ccMax != null) query = query.lte("engine_cc", filters.ccMax);
  if (filters.search) {
    // Strip characters that are meaningful in PostgREST's or()-filter syntax
    // (commas separate conditions, parens group them) so a raw search term
    // can never be misread as a filter expression.
    const term = filters.search.replace(/[,()]/g, " ").trim();
    if (term) {
      query = query.or(`title.ilike.%${term}%,make.ilike.%${term}%,model.ilike.%${term}%`);
    }
  }

  if (filters.sort === "price_low") query = query.order("price_eur", { ascending: true });
  else if (filters.sort === "price_high") query = query.order("price_eur", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data;
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/** RLS returns this only if the listing is active or owned by the caller. */
export async function getById(supabase: Client, id: string) {
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

export async function remove(supabase: Client, id: string) {
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw error;
}
