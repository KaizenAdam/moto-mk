"use client";

import { Listing } from "@/lib/types";
import Just5UpListingPhoto from "./Just5UpListingPhoto";
import Just5UpPriceTag from "./Just5UpPriceTag";
import { formatCc, formatMileage, timeAgo } from "@/lib/format";
import { j5u } from "@/lib/just5up-theme";
import { useSaved } from "@/lib/just5up-saved";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] font-[family-name:var(--font-jetbrains)]"
      style={{ background: j5u.bg, color: j5u.inkMuted, border: `1px solid ${j5u.border}` }}
    >
      {children}
    </span>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 20.5s-7.5-4.6-9.8-9.1C.6 8 1.9 4.3 5.4 3.4c2.1-.6 4.2.3 5.6 2.1.4.5 1 .5 1.4 0 1.4-1.8 3.5-2.7 5.6-2.1 3.5.9 4.8 4.6 3.2 8-2.3 4.5-9.8 9.1-9.8 9.1z" />
    </svg>
  );
}

export default function Just5UpListingCard({ listing }: { listing: Listing }) {
  const { isSaved, toggleSaved } = useSaved();
  const saved = isSaved(listing.slug);

  return (
    <div
      className="rounded-md overflow-hidden border"
      style={{ background: j5u.card, borderColor: j5u.border }}
    >
      <div className="relative">
        <Just5UpListingPhoto
          ridingStyle={listing.ridingStyle}
          sellerType={listing.sellerType}
          photoUrl={listing.photoUrl}
          alt={`${listing.make} ${listing.model}`}
        />
        <button
          type="button"
          onClick={() => toggleSaved(listing.slug)}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved" : "Save this bike"}
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
          style={{
            background: "rgba(255,255,255,0.92)",
            color: saved ? j5u.red : j5u.ink,
          }}
        >
          <HeartIcon filled={saved} />
        </button>
      </div>
      <div className="p-3.5">
        <h3
          className="font-semibold text-[15px] leading-tight truncate"
          style={{ color: j5u.ink }}
        >
          {listing.make} {listing.model}
        </h3>
        <p className="text-xs mt-0.5" style={{ color: j5u.inkMuted }}>
          {listing.year} · {listing.town}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-2.5">
          <Pill>{formatCc(listing.cc)}</Pill>
          <Pill>{listing.ridingStyle}</Pill>
          <Pill>{formatMileage(listing.mileageKm)}</Pill>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px solid ${j5u.border}` }}>
          <Just5UpPriceTag priceEur={listing.priceEur} />
          <span className="text-[11px]" style={{ color: j5u.inkMuted }}>
            {timeAgo(listing.postedDaysAgo)}
          </span>
        </div>
      </div>
    </div>
  );
}
