import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  listActiveFiltered,
  listFilterOptions,
  type ListingFilters,
} from "@/lib/data/listings";
import { listSaved } from "@/lib/data/savedListings";
import { getOwnProfile } from "@/lib/data/profiles";
import { getCoverPhotos } from "@/lib/data/listingPhotos";
import { cachedPhotoSigner } from "@/lib/photos/signer";
import { listActiveDealers } from "@/lib/data/dealers";
import BikesView from "./BikesView";

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

// A hand-edited URL (?priceMax=abc) must not reach the query as NaN —
// PostgREST rejects it and the whole page errors. Ignore anything non-numeric.
function positiveNumber(v: string | undefined) {
  const n = Number(v);
  return v && Number.isFinite(n) && n > 0 ? n : undefined;
}

function parseFilters(sp: SearchParams): ListingFilters {
  const sort = first(sp.sort);
  return {
    make: first(sp.make) || undefined,
    ridingStyle: first(sp.style) || undefined,
    engineType: first(sp.engineType) || undefined,
    town: first(sp.town) || undefined,
    priceMaxEur: positiveNumber(first(sp.priceMax)),
    ccMax: positiveNumber(first(sp.ccMax)),
    search: first(sp.search) || undefined,
    page: positiveNumber(first(sp.page)),
    sort: sort === "price_low" || sort === "price_high" ? sort : "newest",
  };
}

export const metadata: Metadata = {
  title: "Motorcycles for sale in North Macedonia",
  description:
    "Search used and new motorcycles for sale across North Macedonia by make, riding style, engine size, price and town.",
};

export default async function BikesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);

  const supabase = await createClient();

  // Independent fetches run together — listSaved doesn't actually depend on
  // `profile` (it does its own user lookup and returns [] when logged out),
  // so it used to be a wasted extra serial round-trip after this group.
  // getCoverPhotos is the one thing that genuinely can't start until
  // `listings` resolves (it needs the ids), so it stays after.
  const [{ listings, total }, filterOptions, profile, saved, dealers] = await Promise.all([
    listActiveFiltered(supabase, filters),
    listFilterOptions(supabase),
    getOwnProfile(supabase),
    listSaved(supabase),
    listActiveDealers(supabase),
  ]);

  const covers = await getCoverPhotos(
    supabase,
    listings.map((l) => l.id),
    cachedPhotoSigner(supabase)
  );

  return (
    <BikesView
      filters={filters}
      searchParams={sp}
      listings={listings}
      total={total}
      makes={filterOptions.makes}
      towns={filterOptions.towns}
      savedIds={saved.map((s) => s.listing_id)}
      isLoggedIn={!!profile}
      photos={Object.fromEntries(covers)}
      dealerNames={Object.fromEntries(dealers.map((d) => [d.profile_id, d.business_name]))}
    />
  );
}
