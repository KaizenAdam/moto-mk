import { createClient } from "@/lib/supabase/server";
import {
  BROWSE_PAGE_SIZE,
  listActiveFiltered,
  listFilterOptions,
  type ListingFilters,
} from "@/lib/data/listings";
import Pagination from "@/app/components/Pagination";
import { listSaved } from "@/lib/data/savedListings";
import { getOwnProfile } from "@/lib/data/profiles";
import { getCoverPhotoUrls } from "@/lib/data/listingPhotos";
import { cachedPhotoSigner } from "@/lib/photos/signer";
import { listActiveDealers } from "@/lib/data/dealers";
import ListingsFilterBar from "@/app/listings/ListingsFilterBar";
import SortSelect from "@/app/listings/SortSelect";
import ListingsGrid from "@/app/components/ListingsGrid";
import { heroBackground, button } from "@/app/components/ui";

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

export default async function Home({
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
  // getCoverPhotoUrls is the one thing that genuinely can't start until
  // `listings` resolves (it needs the ids), so it stays after.
  const [{ listings, total }, filterOptions, profile, saved, dealers] = await Promise.all([
    listActiveFiltered(supabase, filters),
    listFilterOptions(supabase),
    getOwnProfile(supabase),
    listSaved(supabase),
    listActiveDealers(supabase),
  ]);

  const coverPhotoUrls = await getCoverPhotoUrls(
    supabase,
    listings.map((l) => l.id),
    cachedPhotoSigner(supabase)
  );

  return (
    <main>
      <section
        className="border-b border-line px-5 py-9"
        style={{
          background: heroBackground,
        }}
      >
        <div className="mx-auto max-w-[1280px]">
          <h1 className="font-display mb-1.5 text-3xl">
            Find your next ride in <em className="not-italic text-gold">North Macedonia</em>
          </h1>
          <p className="mb-4 text-sm text-ink-dim">
            Motorcycles, gear and parts — from riders and trusted dealers across Skopje, Ohrid,
            Bitola and beyond.
          </p>
          <form action="/" method="GET" className="flex gap-2.5 rounded-lg border border-line bg-panel p-2">
            <input
              type="text"
              name="search"
              defaultValue={filters.search ?? ""}
              placeholder="Search make, model, e.g. Yamaha R6…"
              className="flex-1 bg-transparent px-2.5 py-2 text-[15px] text-ink outline-none placeholder:text-[#6f6f76]"
            />
            <button
              type="submit"
              className={button("primary")}
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="border-b border-line bg-panel">
        <div className="px-6 py-3.5">
          <ListingsFilterBar makes={filterOptions.makes} towns={filterOptions.towns} current={sp} />
        </div>
      </section>

      <ListingsGrid
        total={total}
        listings={listings}
        savedIds={saved.map((s) => s.listing_id)}
        isLoggedIn={!!profile}
        photoUrls={Object.fromEntries(coverPhotoUrls)}
        sortSelect={<SortSelect current={filters.sort ?? "newest"} searchParams={sp} />}
        dealerNames={Object.fromEntries(dealers.map((d) => [d.profile_id, d.business_name]))}
      />
      <div className="-mt-10 px-6 pb-14">
        <Pagination
          page={filters.page ?? 1}
          pageCount={Math.ceil(total / BROWSE_PAGE_SIZE)}
          searchParams={sp}
        />
      </div>
    </main>
  );
}
