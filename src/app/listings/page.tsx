import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listActiveFiltered, listFilterOptions, type ListingFilters } from "@/lib/data/listings";
import { listSaved } from "@/lib/data/savedListings";
import { getOwnProfile } from "@/lib/data/profiles";
import ListingsFilterBar from "./ListingsFilterBar";
import SaveButton from "@/app/components/SaveButton";

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function parseFilters(sp: SearchParams): ListingFilters {
  const priceMax = first(sp.priceMax);
  const ccMax = first(sp.ccMax);
  return {
    make: first(sp.make) || undefined,
    ridingStyle: first(sp.style) || undefined,
    engineType: first(sp.engineType) || undefined,
    town: first(sp.town) || undefined,
    priceMaxEur: priceMax ? Number(priceMax) : undefined,
    ccMax: ccMax ? Number(ccMax) : undefined,
  };
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);

  const supabase = await createClient();
  const [listings, filterOptions, profile] = await Promise.all([
    listActiveFiltered(supabase, filters),
    listFilterOptions(supabase),
    getOwnProfile(supabase),
  ]);

  const saved = profile ? await listSaved(supabase) : [];
  const savedIds = new Set(saved.map((s) => s.listing_id));

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-amber-400">Browse listings</h1>
          <Link
            href="/sell"
            className="rounded bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300"
          >
            List a bike
          </Link>
        </div>

        <ListingsFilterBar
          makes={filterOptions.makes}
          towns={filterOptions.towns}
          current={sp}
        />

        {listings.length === 0 ? (
          <p className="mt-10 text-center text-zinc-500">
            No listings match those filters yet.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
              >
                <Link href={`/listings/${listing.id}`} className="block">
                  <h2 className="font-semibold text-white">
                    {listing.make} {listing.model}
                  </h2>
                  <p className="text-sm text-zinc-500">
                    {listing.year ?? "—"} · {listing.engine_cc ?? "—"}cc ·{" "}
                    {listing.town ?? "—"}
                  </p>
                  <p className="mt-2 text-lg font-bold text-amber-400">
                    €{Number(listing.price_eur).toLocaleString()}
                  </p>
                </Link>
                <div className="mt-3">
                  <SaveButton
                    listingId={listing.id}
                    initiallySaved={savedIds.has(listing.id)}
                    isLoggedIn={!!profile}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
