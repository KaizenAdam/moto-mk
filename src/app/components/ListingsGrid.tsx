"use client";

import { Fragment, useState, type ReactNode } from "react";
import type { Tables } from "@/lib/database.types";
import type { Currency } from "@/lib/constants/listings";
import ListingCard from "@/app/components/ListingCard";
import CurrencyToggle from "@/app/listings/CurrencyToggle";
import EmptyState from "@/app/components/EmptyState";
import AdSlot from "@/app/components/AdSlot";

export default function ListingsGrid({
  listings,
  savedIds,
  isLoggedIn,
  photos,
  sortSelect,
  dealerNames = {},
  total,
  showAd = false,
}: {
  listings: Tables<"listings">[];
  savedIds: string[];
  isLoggedIn: boolean;
  /** listing id → cover photo URL and photo count (missing = no photos). */
  photos: Record<string, { url: string | null; count: number }>;
  sortSelect: ReactNode;
  /** seller_id → business name, for sellers who are verified dealers. */
  dealerNames?: Record<string, string>;
  /** Total matches across all pages; defaults to the listings shown. */
  total?: number;
  /** Put the results banner ad after the first 12 bikes — a full row at 1, 2, 3 or 4 per row (search results only). */
  showAd?: boolean;
}) {
  const [currency, setCurrency] = useState<Currency>("EUR");
  const savedIdSet = new Set(savedIds);

  return (
    <div className="px-6 py-6 pb-14">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2.5">
        <h2 className="font-display text-2xl font-medium">
          <span className="text-highlight">{(total ?? listings.length).toLocaleString("en-GB")}</span>{" "}
          {(total ?? listings.length) === 1 ? "motorcycle" : "motorcycles"}
        </h2>
        <div className="flex items-center gap-2.5 text-[13px]">
          <CurrencyToggle value={currency} onChange={setCurrency} />
          {sortSelect}
        </div>
      </div>

      {listings.length === 0 ? (
        <EmptyState>No motorcycles match your filters. Try clearing a few.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing, i) => (
            <Fragment key={listing.id}>
              <ListingCard
                listing={listing}
                currency={currency}
                initiallySaved={savedIdSet.has(listing.id)}
                isLoggedIn={isLoggedIn}
                photoUrl={photos[listing.id]?.url ?? undefined}
                photoCount={photos[listing.id]?.count ?? 0}
                dealerName={dealerNames[listing.seller_id]}
              />
              {showAd && i === 11 && listings.length > 12 && (
                <div className="col-span-full">
                  <AdSlot slot="results-inline" />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
