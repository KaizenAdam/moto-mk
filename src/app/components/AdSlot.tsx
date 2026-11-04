"use client";

import Link from "next/link";
import type { AdSlotId } from "@/lib/constants/monetisation";
import { useI18n } from "./I18nProvider";

export type Ad = { imageUrl: string; href: string; advertiser: string };

/**
 * A banner ad position. With an `ad` it shows that advertiser's image;
 * without one (all of them, until the ads backend exists — see
 * docs/HANDOVER-backend.md) it shows Just5Up!'s own "advertise here" card,
 * never a made-up advertiser.
 */
export default function AdSlot({ slot, ad }: { slot: AdSlotId; ad?: Ad | null }) {
  const tall = slot === "listing-sidebar";
  const { t } = useI18n();

  return (
    <aside aria-label={t.ad.label}>
      <p className="mb-1 text-[10px] tracking-widest text-grey uppercase">{t.ad.label}</p>
      {ad ? (
        <a
          href={ad.href}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="block overflow-hidden border border-line"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- advertiser artwork, any host */}
          <img src={ad.imageUrl} alt={ad.advertiser} className="h-auto w-full" />
        </a>
      ) : (
        <Link
          href="/for-business#advertise"
          className={`group flex border border-dashed border-highlight/50 bg-[repeating-linear-gradient(135deg,var(--panel),var(--panel)_14px,var(--panel2)_14px,var(--panel2)_28px)] p-5 transition hover:border-highlight ${
            tall
              ? "min-h-[220px] flex-col justify-center text-center"
              : "flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          }`}
        >
          <div>
            <p className="font-display text-xl text-highlight sm:text-2xl">{t.ad.yourAdHere}</p>
            <p className="mt-1 text-sm text-ink-dim">
              {t.ad.pitch} <span className="text-grey">({t.slots[slot].name})</span>
            </p>
          </div>
          <span className="font-display mt-3 shrink-0 text-sm tracking-wider text-highlight group-hover:underline sm:mt-0">
            {t.ad.advertise}
          </span>
        </Link>
      )}
    </aside>
  );
}
