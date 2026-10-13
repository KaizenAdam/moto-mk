import Link from "next/link";
import type { ReactNode } from "react";
import type { Tables } from "@/lib/database.types";
import { formatPrice, type Currency } from "@/lib/constants/listings";
import { BikeIcon, CameraIcon, EngineIcon, FuelIcon, GaugeIcon, PinIcon } from "@/app/components/icons";
import SaveButton from "@/app/components/SaveButton";
import Badge from "@/app/components/Badge";
import { button } from "@/app/components/ui";

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
 * A bike in a results grid (Bikesales-style): photo with photo count and
 * save heart, title, big price, a 2×2 spec grid, who's selling and where,
 * and Contact / View details buttons.
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
      className={`flex flex-col overflow-hidden rounded-[10px] border bg-panel transition hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(0,0,0,0.4)] ${
        featured
          ? "border-gold shadow-[0_0_0_1px_var(--gold)] hover:border-gold-bright"
          : "border-line hover:border-gold"
      }`}
    >
      <div className="relative aspect-[4/3]">
        <Link href={href} className="absolute inset-0 block">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- signed URL rotates per request, not a next/image candidate
            <img
              src={photoUrl}
              alt={name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#26262b] to-[#18181b] text-xs text-grey">
              No photo yet
            </div>
          )}
        </Link>
        {featured && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <Badge>Featured</Badge>
          </div>
        )}
        {photoCount > 0 && (
          <span className="pointer-events-none absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[11px] text-ink">
            <CameraIcon />
            {photoCount}
          </span>
        )}
        <div className="absolute top-2.5 right-2.5 z-10">
          <SaveButton listingId={listing.id} initiallySaved={initiallySaved} isLoggedIn={isLoggedIn} variant="badge" />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3.5 pt-3 pb-3.5">
        <Link href={href} className="font-display line-clamp-2 text-[17px] font-semibold text-ink hover:text-gold-bright">
          {name}
        </Link>
        <div className="mt-1">
          <span className="font-display text-2xl text-gold-bright">{price.main}</span>
          <span className="ml-1.5 text-[11px] text-grey">{price.alt}</span>
        </div>

        <div className="my-3 grid grid-cols-2 gap-x-3 gap-y-1.5 border-y border-line py-2.5 text-xs text-ink-dim">
          {listing.riding_style && <Spec icon={<BikeIcon />}>{listing.riding_style}</Spec>}
          {listing.engine_cc != null && <Spec icon={<EngineIcon />}>{listing.engine_cc.toLocaleString("en-GB")} cc</Spec>}
          {listing.mileage_km != null && <Spec icon={<GaugeIcon />}>{listing.mileage_km.toLocaleString("en-GB")} km</Spec>}
          {listing.engine_type && <Spec icon={<FuelIcon />}>{listing.engine_type}</Spec>}
        </div>

        <div className="mb-3 flex items-center gap-1.5 text-xs text-grey">
          <span className="truncate">
            {dealerName ? (
              <>
                Dealer · <span className="text-gold-bright">{dealerName}</span>
              </>
            ) : (
              "Private seller"
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
          <Link href={`${href}#contact`} className={button("outline", "sm")}>
            Contact
          </Link>
          <Link href={href} className={button("primary", "sm")}>
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}

function Spec({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="shrink-0 text-gold">{icon}</span>
      <span className="truncate">{children}</span>
    </span>
  );
}
