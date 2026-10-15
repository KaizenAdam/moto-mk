import Link from "next/link";
import type { ReactNode } from "react";
import type { Tables } from "@/lib/database.types";
import { formatPrice, type Currency } from "@/lib/constants/listings";
import { BikeIcon, CameraIcon, EngineIcon, GaugeIcon, PinIcon, StoreIcon, UserIcon } from "@/app/components/icons";
import SaveButton from "@/app/components/SaveButton";

/** One card's worth of data, for pages that list a handful of bikes (home, similar bikes). */
export type ListingCardData = {
  listing: Tables<"listings">;
  saved: boolean;
  photoUrl?: string;
  photoCount: number;
  dealerName?: string;
  featured?: boolean;
};

/**
 * A bike in a results grid: photo with photo count and save heart, title,
 * spec line, the gold price tag (as on the home page), who's selling and
 * where, and Contact / View bike buttons. Square-cornered, like the rest
 * of the Oct 2026 look.
 */
export default function ListingCard({
  listing,
  currency,
  initiallySaved,
  isLoggedIn,
  photoUrl,
  photoCount = 0,
  dealerName,
  featured = false,
}: {
  listing: Tables<"listings">;
  currency: Currency;
  initiallySaved: boolean;
  isLoggedIn: boolean;
  photoUrl?: string;
  photoCount?: number;
  /** Set when the seller is a verified dealer. */
  dealerName?: string;
  /**
   * Paid placement: gold frame and a Featured badge. Only ever pass true for
   * a listing that really is featured (see docs/HANDOVER-backend.md) — never
   * as decoration.
   */
  featured?: boolean;
}) {
  const href = `/listings/${listing.id}`;
  const price = formatPrice(Number(listing.price_eur), currency);
  const name = [listing.year, listing.make, listing.model].filter(Boolean).join(" ");

  return (
    <div
      className={`group/card flex flex-col bg-panel transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.5)] ${
        featured ? "outline-2 outline-highlight outline-solid" : "outline-1 outline-line outline-solid hover:outline-[#4a4a50]"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-panel2">
        <Link href={href} className="absolute inset-0 block" tabIndex={-1} aria-hidden>
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- signed URL rotates per request, not a next/image candidate
            <img
              src={photoUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-500 group-hover/card:scale-[1.04]"
              draggable={false}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-[#26262b] to-[#18181b] text-xs text-grey">
              <CameraIcon className="h-6 w-6" />
              No photo yet
            </div>
          )}
        </Link>
        {featured && (
          <span className="font-display absolute top-0 left-0 z-10 bg-highlight px-2.5 py-1 text-xs tracking-wider text-[#111]">
            Featured
          </span>
        )}
        {photoCount > 0 && (
          <span className="pointer-events-none absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            <CameraIcon />
            {photoCount}
          </span>
        )}
        <div className="absolute top-2.5 right-2.5 z-10">
          <SaveButton listingId={listing.id} initiallySaved={initiallySaved} isLoggedIn={isLoggedIn} variant="badge" />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pt-3.5 pb-4">
        <Link href={href} className="font-display line-clamp-2 text-[19px] leading-tight font-medium text-ink hover:text-highlight">
          {name}
        </Link>

        <div className="mt-2 flex flex-wrap gap-x-3.5 gap-y-1 text-[13px] text-ink-dim">
          {listing.engine_cc != null && <Spec icon={<EngineIcon />}>{listing.engine_cc.toLocaleString("en-GB")}cc</Spec>}
          {listing.mileage_km != null && <Spec icon={<GaugeIcon />}>{listing.mileage_km.toLocaleString("en-GB")} km</Spec>}
          {listing.riding_style && <Spec icon={<BikeIcon />}>{listing.riding_style}</Spec>}
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display bg-highlight px-2.5 py-0.5 text-[22px] font-medium text-[#111]">{price.main}</span>
          <span className="text-[11px] text-grey">{price.alt}</span>
        </div>

        <div className="mt-3.5 mb-4 flex items-center gap-2 border-t border-line pt-3 text-xs text-grey">
          <span className="flex min-w-0 items-center gap-1.5">
            {dealerName ? (
              <>
                <StoreIcon className="h-4 w-4 shrink-0 text-highlight" />
                <span className="truncate text-ink">{dealerName}</span>
              </>
            ) : (
              <>
                <UserIcon className="h-4 w-4 shrink-0" />
                Private seller
              </>
            )}
          </span>
          {listing.town && (
            <span className="ml-auto flex shrink-0 items-center gap-1">
              <PinIcon />
              {listing.town}
            </span>
          )}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <Link
            href={`${href}#contact`}
            className="font-display flex items-center justify-center border-2 border-red py-1.5 text-[13px] font-medium tracking-[.06em] text-white transition hover:bg-red"
          >
            Contact
          </Link>
          <Link
            href={href}
            className="font-display flex items-center justify-center bg-highlight py-1.5 text-[13px] font-medium tracking-[.06em] text-[#111] transition hover:brightness-110"
          >
            View bike &gt;&gt;&gt;
          </Link>
        </div>
      </div>
    </div>
  );
}

function Spec({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      <span className="shrink-0 text-highlight">{icon}</span>
      <span className="truncate">{children}</span>
    </span>
  );
}
