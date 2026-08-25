import { createClient } from "@/lib/supabase/server";
import { listActiveFiltered, listFilterOptions, type ListingFilters } from "@/lib/data/listings";
import { listSaved } from "@/lib/data/savedListings";
import { getOwnProfile } from "@/lib/data/profiles";
import { getCoverPhotoUrls } from "@/lib/data/listingPhotos";
import type { Currency } from "@/lib/constants/listings";
import ListingsFilterBar from "@/app/listings/ListingsFilterBar";
import CurrencyToggle from "@/app/listings/CurrencyToggle";
import SortSelect from "@/app/listings/SortSelect";
import ListingCard from "@/app/components/ListingCard";

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
  const currency: Currency = first(sp.cur) === "MKD" ? "MKD" : "EUR";

  const supabase = await createClient();
  const [listings, filterOptions, profile] = await Promise.all([
    listActiveFiltered(supabase, filters),
    listFilterOptions(supabase),
    getOwnProfile(supabase),
  ]);

  const saved = profile ? await listSaved(supabase) : [];
  const savedIds = new Set(saved.map((s) => s.listing_id));
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

      <div className="px-6 py-6 pb-14">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
          <div className="text-sm text-ink-dim">
            <b className="text-ink">{listings.length}</b> motorcycles found
          </div>
          <div className="flex items-center gap-2.5 text-[13px]">
            <CurrencyToggle current={currency} searchParams={sp} />
            <SortSelect current={filters.sort ?? "newest"} searchParams={sp} />
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-line px-5 py-10 text-center text-sm text-ink-dim">
            No motorcycles match your filters. Try clearing a few.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                currency={currency}
                initiallySaved={savedIds.has(listing.id)}
                isLoggedIn={!!profile}
                photoUrl={coverPhotoUrls.get(listing.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
