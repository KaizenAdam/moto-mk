import Link from "next/link";
import { formatPrice, type Currency } from "@/lib/constants/listings";
import { CameraIcon, PinIcon } from "@/app/components/icons";
import Badge from "@/app/components/Badge";
import { button } from "@/app/components/ui";

/**
 * A part or piece of gear, in the client's card format: name on top, then
 * photo and price, then "Read more". Built ahead of the parts backend
 * (docs/HANDOVER-backend.md) — nothing renders it until real parts exist.
 */
export type PartCardData = {
  id: string;
  title: string;
  brand: string | null;
  /** A subcategory name from PART_CATEGORIES, e.g. "Helmets". */
  subcategory: string;
  condition: string | null;
  priceEur: number;
  town: string | null;
  photoUrl?: string;
  photoCount?: number;
};

export default function PartCard({ part, currency = "EUR" }: { part: PartCardData; currency?: Currency }) {
  const href = `/parts-gear/${part.id}`;
  const price = formatPrice(part.priceEur, currency);

  return (
    <div className="flex flex-col overflow-hidden rounded-[10px] border border-line bg-panel transition hover:-translate-y-0.5 hover:border-gold">
      <Link href={href} className="font-display line-clamp-2 px-3.5 pt-3 pb-2 text-[17px] font-semibold text-ink hover:text-gold-bright">
        {part.title}
      </Link>
      <Link href={href} className="relative block aspect-[4/3] bg-panel2">
        {part.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- signed URL rotates per request
          <img src={part.photoUrl} alt={part.title} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center text-xs text-grey">No photo yet</span>
        )}
        {(part.photoCount ?? 0) > 0 && (
          <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[11px] text-ink">
            <CameraIcon />
            {part.photoCount}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col px-3.5 pt-2.5 pb-3.5">
        <div>
          <span className="font-display text-2xl text-gold-bright">{price.main}</span>
          <span className="ml-1.5 text-[11px] text-grey">{price.alt}</span>
        </div>
        <div className="mt-2 mb-3 flex flex-wrap items-center gap-1.5 text-xs text-ink-dim">
          <Badge tone="muted">{part.subcategory}</Badge>
          {part.brand && <span>{part.brand}</span>}
          {part.condition && <span className="text-grey">· {part.condition}</span>}
          {part.town && (
            <span className="ml-auto flex items-center gap-1 text-grey">
              <PinIcon />
              {part.town}
            </span>
          )}
        </div>
        <Link href={href} className={`${button("primary", "sm")} mt-auto`}>
          Read more
        </Link>
      </div>
    </div>
  );
}
