import Link from "next/link";
import type { Tables } from "@/lib/database.types";
import { formatPrice, type Currency } from "@/lib/constants/listings";
import { PinIcon } from "@/app/components/icons";
import SaveButton from "@/app/components/SaveButton";

export default function ListingCard({
  listing,
  currency,
  initiallySaved,
  isLoggedIn,
}: {
  listing: Tables<"listings">;
  currency: Currency;
  initiallySaved: boolean;
  isLoggedIn: boolean;
}) {
  const price = formatPrice(Number(listing.price_eur), currency);

  return (
    <div className="overflow-hidden rounded-[10px] border border-line bg-panel transition hover:-translate-y-0.5 hover:border-gold hover:shadow-[0_8px_22px_rgba(0,0,0,0.4)]">
      <div className="relative aspect-[4/3]">
        <Link href={`/listings/${listing.id}`} className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#26262b] to-[#18181b] text-xs text-grey">
          No photo yet
        </Link>
        <div className="absolute top-2.5 right-2.5 z-10">
          <SaveButton listingId={listing.id} initiallySaved={initiallySaved} isLoggedIn={isLoggedIn} variant="badge" />
        </div>
      </div>

      <Link href={`/listings/${listing.id}`} className="block px-3 pt-2.5 pb-3">
        <div className="truncate text-sm font-bold text-ink">
          {listing.make} {listing.model}
        </div>
        <div className="mb-1.5 text-base font-extrabold text-gold-bright">
          {price.main} <span className="ml-1 text-[11px] font-normal text-grey">{price.alt}</span>
        </div>
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          {listing.engine_cc != null && (
            <span className="rounded border border-line bg-panel2 px-1.5 py-0.5 text-[11px] text-ink-dim">
              {listing.engine_cc}cc
            </span>
          )}
          {listing.engine_type && (
            <span className="rounded border border-line bg-panel2 px-1.5 py-0.5 text-[11px] text-ink-dim">
              {listing.engine_type}
            </span>
          )}
          {listing.riding_style && (
            <span className="rounded border border-line bg-panel2 px-1.5 py-0.5 text-[11px] text-ink-dim">
              {listing.riding_style}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-grey">
          <PinIcon />
          {listing.town ?? "—"}
        </div>
      </Link>
    </div>
  );
}
