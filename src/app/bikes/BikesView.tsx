import type { Tables } from "@/lib/database.types";
import { BROWSE_PAGE_SIZE, type ListingFilters } from "@/lib/data/listings";
import Pagination from "@/app/components/Pagination";
import ListingsFilterBar from "@/app/listings/ListingsFilterBar";
import SortSelect from "@/app/listings/SortSelect";
import ListingsGrid from "@/app/components/ListingsGrid";
import PageHero from "@/app/components/PageHero";
import { SearchIcon } from "@/app/components/icons";
import type { SearchParams } from "@/app/listings/queryParams";

/**
 * The search page: the glow hero the client liked (with one torn shard),
 * a white search box like the home page's, the filter bar, then results.
 * Markup only; page.tsx fetches.
 */
export default function BikesView({
  filters,
  searchParams,
  listings,
  total,
  makes,
  towns,
  savedIds,
  isLoggedIn,
  photos,
  dealerNames,
}: {
  filters: ListingFilters;
  searchParams: SearchParams;
  listings: Tables<"listings">[];
  total: number;
  makes: string[];
  towns: string[];
  savedIds: string[];
  isLoggedIn: boolean;
  photos: Record<string, { url: string | null; count: number }>;
  dealerNames: Record<string, string>;
}) {
  return (
    <main>
      <PageHero
        size="lg"
        shard
        title={
          <>
            Bikes for sale in <span className="text-highlight">North Macedonia</span>
          </>
        }
        intro="From riders and verified dealers across Skopje, Ohrid, Bitola and beyond. Every listing is checked before it goes live."
      >
        <form action="/bikes" method="GET" className="flex max-w-[640px] bg-white">
          <label htmlFor="bikes-search" className="sr-only">
            Search bikes
          </label>
          <span className="flex items-center pl-4 text-[#77767c]">
            <SearchIcon />
          </span>
          <input
            id="bikes-search"
            type="text"
            name="search"
            defaultValue={filters.search ?? ""}
            placeholder="Make or model — e.g. Yamaha R6"
            className="min-w-0 flex-1 border-0 px-3 py-4 text-base text-[#111] outline-none placeholder:text-[#77767c]"
          />
          <button
            type="submit"
            className="font-display bg-highlight px-4 text-base font-semibold tracking-[.08em] text-[#111] transition hover:brightness-110 sm:px-6"
          >
            Search<span className="hidden sm:inline"> &gt;&gt;&gt;</span>
          </button>
        </form>
      </PageHero>

      <section className="border-b border-line bg-panel">
        <div className="px-4 py-3.5 sm:px-6">
          <ListingsFilterBar makes={makes} towns={towns} current={searchParams} />
        </div>
      </section>

      <ListingsGrid
        total={total}
        showAd
        listings={listings}
        savedIds={savedIds}
        isLoggedIn={isLoggedIn}
        photos={photos}
        sortSelect={<SortSelect key="sort" current={filters.sort ?? "newest"} searchParams={searchParams} />}
        dealerNames={dealerNames}
      />
      <div className="-mt-10 px-6 pb-14">
        <Pagination page={filters.page ?? 1} pageCount={Math.ceil(total / BROWSE_PAGE_SIZE)} searchParams={searchParams} />
      </div>
    </main>
  );
}
