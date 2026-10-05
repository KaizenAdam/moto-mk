"use client";

import { useState, type ReactNode } from "react";
import type { Tables } from "@/lib/database.types";
import type { Currency } from "@/lib/constants/listings";
import ListingCard from "@/app/components/ListingCard";
import CurrencyToggle from "@/app/listings/CurrencyToggle";

export default function ListingsGrid({
  listings,
  savedIds,
  isLoggedIn,
  photoUrls,
  sortSelect,
  dealerNames = {},
  total,
}: {
  listings: Tables<"listings">[];
  savedIds: string[];
  isLoggedIn: boolean;
  photoUrls: Record<string, string>;
  sortSelect: ReactNode;
  /** seller_id → business name, for sellers who are verified dealers. */
  dealerNames?: Record<string, string>;
  /** Total matches across all pages; defaults to the listings shown. */
  total?: number;
}) {
  const [currency, setCurrency] = useState<Currency>("EUR");
  const savedIdSet = new Set(savedIds);

  return (
    <div className="px-6 py-6 pb-14">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <div className="text-sm text-ink-dim">
          <b className="text-ink">{total ?? listings.length}</b> motorcycles found
        </div>
        <div className="flex items-center gap-2.5 text-[13px]">
          <CurrencyToggle value={currency} onChange={setCurrency} />
          {sortSelect}
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
              initiallySaved={savedIdSet.has(listing.id)}
              isLoggedIn={isLoggedIn}
              photoUrl={photoUrls[listing.id]}
              dealerName={dealerNames[listing.seller_id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
