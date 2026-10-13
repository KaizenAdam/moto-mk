"use client";

import { useState } from "react";
import type { Tables } from "@/lib/database.types";
import { FEATURE_PACKAGES, formatPackagePrice, type FeaturePackageId } from "@/lib/constants/monetisation";
import ListingCard from "@/app/components/ListingCard";
import { button, card } from "@/app/components/ui";

/** Package picker, a preview of the featured card, and the order summary. */
export default function FeatureForm({
  listing,
  photoUrl,
  photoCount,
  dealerName,
}: {
  listing: Tables<"listings">;
  photoUrl?: string;
  photoCount: number;
  dealerName?: string;
}) {
  const [selected, setSelected] = useState<FeaturePackageId>("featured-7");
  const pkg = FEATURE_PACKAGES.find((p) => p.id === selected)!;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <fieldset>
        <legend className="font-display mb-4 text-xl">1. Choose a package</legend>
        <div className="grid gap-3 md:grid-cols-3">
          {FEATURE_PACKAGES.map((p) => {
            const active = p.id === selected;
            return (
              <label
                key={p.id}
                className={`${card} relative flex cursor-pointer flex-col p-4 transition ${
                  active ? "border-gold shadow-[0_0_0_1px_var(--gold)]" : "hover:border-gold/60"
                }`}
              >
                <input
                  type="radio"
                  name="package"
                  value={p.id}
                  checked={active}
                  onChange={() => setSelected(p.id)}
                  className="sr-only"
                />
                <span className="font-display text-lg text-ink">{p.name}</span>
                <span className="font-display mt-1 text-2xl text-gold-bright">{formatPackagePrice(p.priceEur)}</span>
                <span className="mt-2 text-sm text-ink-dim">{p.summary}</span>
                <ul className="mt-3 space-y-1 text-xs text-ink-dim">
                  {p.perks.map((perk) => (
                    <li key={perk}>✓ {perk}</li>
                  ))}
                </ul>
              </label>
            );
          })}
        </div>

        <h2 className="font-display mt-8 mb-4 text-xl">2. How your bike will look</h2>
        <div className="max-w-[320px]">
          <ListingCard
            listing={listing}
            currency="EUR"
            initiallySaved={false}
            isLoggedIn
            photoUrl={photoUrl}
            photoCount={photoCount}
            dealerName={dealerName}
            featured={selected !== "bump"}
          />
        </div>
      </fieldset>

      <aside className={`${card} h-fit p-5 lg:sticky lg:top-24`}>
        <h2 className="font-display mb-4 text-xl">Summary</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-grey">Bike</dt>
            <dd className="text-right text-ink">{listing.title}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-grey">Package</dt>
            <dd className="text-right text-ink">{pkg.name}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-line pt-2">
            <dt className="text-grey">Total</dt>
            <dd className="font-display text-xl text-gold-bright">{formatPackagePrice(pkg.priceEur)}</dd>
          </div>
        </dl>
        <button type="button" disabled className={`${button("primary", "lg")} mt-5 w-full`}>
          Continue to payment
        </button>
        <p className="mt-2 text-xs text-grey">
          Online payment is coming soon. Nothing will be charged from this page yet.
        </p>
      </aside>
    </div>
  );
}
