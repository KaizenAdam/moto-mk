import Link from "next/link";
import { AD_SLOTS, type AdSlotId } from "@/lib/constants/monetisation";

export type Ad = { imageUrl: string; href: string; advertiser: string };

/**
 * A banner ad position. With an `ad` it shows that advertiser's image;
 * without one (all of them, until the ads backend exists — see
 * docs/HANDOVER-backend.md) it shows Just5Up!'s own "advertise here" card,
 * never a made-up advertiser.
 */
export default function AdSlot({ slot, ad }: { slot: AdSlotId; ad?: Ad | null }) {
  const tall = slot === "listing-sidebar";

  return (
    <aside aria-label="Advertisement">
      <p className="mb-1 text-[10px] tracking-widest text-grey uppercase">Advertisement</p>
      {ad ? (
        <a
          href={ad.href}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="block overflow-hidden rounded-[10px] border border-line"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- advertiser artwork, any host */}
          <img src={ad.imageUrl} alt={ad.advertiser} className="h-auto w-full" />
        </a>
      ) : (
        <Link
          href="/advertise"
          className={`group flex rounded-[10px] border border-dashed border-gold/50 bg-[repeating-linear-gradient(135deg,var(--panel),var(--panel)_14px,var(--panel2)_14px,var(--panel2)_28px)] p-5 transition hover:border-gold ${
            tall ? "min-h-[220px] flex-col justify-center text-center" : "flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          }`}
        >
          <div>
            <p className="font-display text-xl text-gold-bright sm:text-2xl">Your ad here</p>
            <p className="mt-1 text-sm text-ink-dim">
              Reach riders across North Macedonia — workshops, gear shops, insurers.{" "}
              <span className="text-grey">({AD_SLOTS[slot].name})</span>
            </p>
          </div>
          <span className="font-display mt-3 shrink-0 text-sm tracking-wider text-gold-bright group-hover:underline sm:mt-0">
            Advertise with us →
          </span>
        </Link>
      )}
    </aside>
  );
}
