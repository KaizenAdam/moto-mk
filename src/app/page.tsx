import { createClient } from "@/lib/supabase/server";
import { listActiveFiltered, listFilterOptions, type ListingFilters } from "@/lib/data/listings";
import { listSaved } from "@/lib/data/savedListings";
import { getOwnProfile } from "@/lib/data/profiles";
import { getCoverPhotoUrls } from "@/lib/data/listingPhotos";
import ListingsFilterBar from "@/app/listings/ListingsFilterBar";
import SortSelect from "@/app/listings/SortSelect";
import ListingsGrid from "@/app/components/ListingsGrid";

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function parseFilters(sp: SearchParams): ListingFilters {
  const priceMax = first(sp.priceMax);
  const ccMax = first(sp.ccMax);
  const sort = first(sp.sort);
  return {
    make: first(sp.make) || undefined,
    ridingStyle: first(sp.style) || undefined,
    engineType: first(sp.engineType) || undefined,
    town: first(sp.town) || undefined,
    priceMaxEur: priceMax ? Number(priceMax) : undefined,
    ccMax: ccMax ? Number(ccMax) : undefined,
    search: first(sp.search) || undefined,
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
  const [listings, filterOptions, profile, saved] = await Promise.all([
    listActiveFiltered(supabase, filters),
    listFilterOptions(supabase),
    getOwnProfile(supabase),
    listSaved(supabase),
  ]);

  const coverPhotoUrls = await getCoverPhotoUrls(
    supabase,
    listings.map((l) => l.id)
  );

  return (
    <main>
      <section
        className="border-b border-line px-5 py-9"
        style={{
          background:
            "radial-gradient(circle at 80% 0%, rgba(193,39,45,.18), transparent 55%), radial-gradient(circle at 10% 100%, rgba(212,175,55,.12), transparent 50%), #0e0e11",
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
              className="rounded-md bg-gradient-to-br from-gold-bright to-gold px-[18px] py-[9px] text-[13px] font-bold tracking-wide text-[#141414] uppercase shadow-[0_2px_10px_rgba(212,175,55,0.25)] transition hover:brightness-110"
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
        listings={listings}
        savedIds={saved.map((s) => s.listing_id)}
        isLoggedIn={!!profile}
        photoUrls={Object.fromEntries(coverPhotoUrls)}
        sortSelect={<SortSelect current={filters.sort ?? "newest"} searchParams={sp} />}
      />
    </main>
  );
}
