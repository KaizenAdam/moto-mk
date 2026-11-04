import type { Tables } from "@/lib/database.types";
import { BROWSE_PAGE_SIZE, type ListingFilters } from "@/lib/data/listings";
import Pagination from "@/app/components/Pagination";
import ListingsFilterBar from "@/app/listings/ListingsFilterBar";
import SortSelect from "@/app/listings/SortSelect";
import ListingsGrid from "@/app/components/ListingsGrid";
import PageHero from "@/app/components/PageHero";
import { SearchIcon } from "@/app/components/icons";
import { getI18n } from "@/lib/i18n/server";
import type { SearchParams } from "@/app/listings/queryParams";

/**
 * The search page: the glow hero the client liked (with one red chevron shard),
 * a white search box like the home page's, the filter bar, then results.
 * Markup only; page.tsx fetches.
 */
export default async function BikesView({
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
  const { t } = await getI18n();
  const b = t.bikes;
  return (
    <main>
      <PageHero
        size="lg"
        shard={{
          shape: "double",
          className:
            "bottom-[-30%] right-[-160px] h-[150%] w-[420px] rotate-[-24deg] bg-red/[.20] sm:right-[4%] sm:w-[560px]",
        }}
        title={
          <>
            {b.title1} <span className="text-highlight">{b.title2}</span>
          </>
        }
        intro={b.intro}
      >
        <form action="/bikes" method="GET" className="flex max-w-[640px] bg-white">
          <label htmlFor="bikes-search" className="sr-only">
            {b.searchLabel}
          </label>
          <span className="flex items-center pl-4 text-[#77767c]">
            <SearchIcon />
          </span>
          <input
            id="bikes-search"
            type="text"
            name="search"
            defaultValue={filters.search ?? ""}
            placeholder={b.searchPlaceholder}
            className="min-w-0 flex-1 border-0 px-3 py-4 text-base text-[#111] outline-none placeholder:text-[#77767c]"
          />
          <button
            type="submit"
            className="font-display bg-highlight px-4 text-base font-semibold tracking-[.08em] text-[#111] transition hover:brightness-110 sm:px-6"
          >
            {b.searchButton}
            <span className="hidden sm:inline"> &gt;&gt;&gt;</span>
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
        <Pagination
          page={filters.page ?? 1}
          pageCount={Math.ceil(total / BROWSE_PAGE_SIZE)}
          searchParams={searchParams}
        />
      </div>
    </main>
  );
}
