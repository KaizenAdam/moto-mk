import Link from "next/link";
import type { Tables } from "@/lib/database.types";
import { formatPrice, type Currency } from "@/lib/constants/listings";
import { PinIcon } from "@/app/components/icons";
import SaveButton from "@/app/components/SaveButton";
import Badge from "@/app/components/Badge";
import Chip from "@/app/components/Chip";

export default function ListingCard({
  listing,
  currency,
  initiallySaved,
  isLoggedIn,
  photoUrl,
  dealerName,
}: {
  listing: Tables<"listings">;
  currency: Currency;
  initiallySaved: boolean;
  isLoggedIn: boolean;
  photoUrl?: string;
  /** Set when the seller is a verified dealer — shown as a badge. */
  dealerName?: string;
}) {
  const price = formatPrice(Number(listing.price_eur), currency);

  return (
    <div className="overflow-hidden rounded-[10px] border border-line bg-panel transition hover:-translate-y-0.5 hover:border-gold hover:shadow-[0_8px_22px_rgba(0,0,0,0.4)]">
      <div className="relative aspect-[4/3]">
        <Link href={`/listings/${listing.id}`} className="absolute inset-0 block">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- signed URL rotates per request, not a next/image candidate
            <img
              src={photoUrl}
              alt={`${listing.make} ${listing.model}`}
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
        <div className="absolute top-2.5 right-2.5 z-10">
          <SaveButton listingId={listing.id} initiallySaved={initiallySaved} isLoggedIn={isLoggedIn} variant="badge" />
        </div>
      </div>

      <Link href={`/listings/${listing.id}`} className="block px-3 pt-2.5 pb-3">
        <div className="font-display truncate text-base font-semibold text-ink">
          {listing.make} {listing.model}
        </div>
        <div className="font-display mb-1.5 text-xl text-gold-bright">
          {price.main} <span className="ml-1 font-sans text-[11px] font-normal normal-case text-grey">{price.alt}</span>
        </div>
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          {listing.engine_cc != null && <Chip>{listing.engine_cc}cc</Chip>}
          {listing.engine_type && <Chip>{listing.engine_type}</Chip>}
          {listing.riding_style && <Chip>{listing.riding_style}</Chip>}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-grey">
          <PinIcon />
          {listing.town ?? "—"}
          {dealerName && (
            <Badge tone="soft" className="ml-auto max-w-[60%] truncate">
              {dealerName}
            </Badge>
          )}
        </div>
      </Link>
    </div>
  );
}
