import { Listing } from "@/lib/types";
import ListingPhoto from "./ListingPhoto";
import PricePlate from "./PricePlate";
import { formatCc, formatMileage, timeAgo } from "@/lib/format";

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <div className="bg-paper border border-tarmac-line/20 rounded-xl overflow-hidden">
      <ListingPhoto
        ridingStyle={listing.ridingStyle}
        make={listing.make}
        model={listing.model}
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display uppercase tracking-wide text-lg leading-tight">
              {listing.make} {listing.model}
            </h3>
            <p className="text-sm text-steel-dark font-body">
              {listing.year} · {listing.town}
            </p>
          </div>
          <PricePlate priceEur={listing.priceEur} size="sm" />
        </div>
        <dl className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-data text-steel-dark">
          <div>
            <dt className="sr-only">Engine size</dt>
            <dd>{formatCc(listing.cc)}</dd>
          </div>
          <div>
            <dt className="sr-only">Licence category</dt>
            <dd className="text-amber-dim">{listing.licenseCategory}</dd>
          </div>
          <div>
            <dt className="sr-only">Mileage</dt>
            <dd>{formatMileage(listing.mileageKm)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-steel-dark font-body">
          {listing.sellerType === "Dealer" ? "Dealer" : "Private seller"} · {timeAgo(listing.postedDaysAgo)}
        </p>
      </div>
    </div>
  );
}
