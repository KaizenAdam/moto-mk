"use client";

import { useState } from "react";
import type { Tables } from "@/lib/database.types";
import { FEATURE_PACKAGES, formatPackagePrice, type FeaturePackageId } from "@/lib/constants/monetisation";
import ListingCard from "@/app/components/ListingCard";
import { button, card } from "@/app/components/ui";
import { useI18n } from "@/app/components/I18nProvider";

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
  const { t } = useI18n();
  const P = t.feature;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <fieldset>
        <legend className="font-display mb-4 text-xl">{P.choose}</legend>
        <div className="grid gap-3 md:grid-cols-3">
          {FEATURE_PACKAGES.map((p) => {
            const active = p.id === selected;
            return (
              <label
                key={p.id}
                className={`${card} relative flex cursor-pointer flex-col p-4 transition ${
                  active ? "border-highlight shadow-[0_0_0_1px_var(--highlight)]" : "hover:border-highlight/60"
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
                <span className="font-display text-lg text-ink">{t.packages[p.id].name}</span>
                <span className="font-display mt-1 text-2xl text-highlight">
                  {formatPackagePrice(p.priceEur, t.common.priceTbc)}
                </span>
                <span className="mt-2 text-sm text-ink-dim">{t.packages[p.id].summary}</span>
                <ul className="mt-3 space-y-1 text-xs text-ink-dim">
                  {t.packages[p.id].perks.map((perk) => (
                    <li key={perk}>✓ {perk}</li>
                  ))}
                </ul>
              </label>
            );
          })}
        </div>

        <h2 className="font-display mt-8 mb-4 text-xl">{P.howItLooks}</h2>
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
        <h2 className="font-display mb-4 text-xl">{P.summary}</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-grey">{P.bike}</dt>
            <dd className="text-right text-ink">{listing.title}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-grey">{P.package}</dt>
            <dd className="text-right text-ink">{t.packages[pkg.id].name}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-line pt-2">
            <dt className="text-grey">{P.total}</dt>
            <dd className="font-display text-xl text-highlight">
              {formatPackagePrice(pkg.priceEur, t.common.priceTbc)}
            </dd>
          </div>
        </dl>
        <button type="button" disabled className={`${button("primary", "lg")} mt-5 w-full`}>
          {P.continuePayment}
        </button>
        <p className="mt-2 text-xs text-grey">{P.paymentSoon}</p>
      </aside>
    </div>
  );
}
