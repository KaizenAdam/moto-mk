import Link from "next/link";
import type { ReactNode } from "react";
import type { Tables } from "@/lib/database.types";
import { formatPrice } from "@/lib/constants/listings";
import {
  BikeIcon,
  CalendarIcon,
  EngineIcon,
  FuelIcon,
  GaugeIcon,
  IdIcon,
  PinIcon,
  PlaceIcon,
} from "@/app/components/icons";
import SaveButton from "@/app/components/SaveButton";
import Badge from "@/app/components/Badge";
import ListingCard from "@/app/components/ListingCard";
import SectionHeading from "@/app/components/SectionHeading";
import { card } from "@/app/components/ui";
import { ContactCard, MeetTheSeller, MobileContactBar, type ContactProps } from "./ContactSeller";
import PhotoGallery from "./PhotoGallery";
import ShareButton from "./ShareButton";

type Similar = {
  listing: Tables<"listings">;
  saved: boolean;
  photoUrl?: string;
  photoCount: number;
  dealerName?: string;
};

/**
 * A bike's page, Auto Trader-style: photo mosaic, then details on the left
 * (title and price, overview, description, seller, safety tips) and a
 * sticky contact card on the right. On phones the contact buttons pin to
 * the bottom of the screen instead. Markup only — page.tsx fetches.
 */
export default function ListingView({
  listing,
  bikeName,
  listingUrl,
  photoUrls,
  isSaved,
  isLoggedIn,
  isDealer,
  contactProps,
  similar,
}: {
  listing: Tables<"listings">;
  bikeName: string;
  listingUrl: string;
  photoUrls: string[];
  isSaved: boolean;
  isLoggedIn: boolean;
  isDealer: boolean;
  contactProps: ContactProps;
  similar: Similar[];
}) {
  const price = formatPrice(Number(listing.price_eur), "EUR");
  const subtitle = [
    listing.engine_cc != null ? `${listing.engine_cc.toLocaleString("en-GB")}cc` : null,
    listing.riding_style,
    listing.engine_type,
  ]
    .filter(Boolean)
    .join(" · ");

  const overview: { icon: ReactNode; label: string; value: string | null }[] = [
    { icon: <CalendarIcon className="h-5 w-5" />, label: "Year", value: listing.year?.toString() ?? null },
    {
      icon: <GaugeIcon className="h-5 w-5" />,
      label: "Mileage",
      value: listing.mileage_km != null ? `${listing.mileage_km.toLocaleString("en-GB")} km` : null,
    },
    {
      icon: <EngineIcon className="h-5 w-5" />,
      label: "Engine size",
      value: listing.engine_cc != null ? `${listing.engine_cc.toLocaleString("en-GB")} cc` : null,
    },
    { icon: <FuelIcon className="h-5 w-5" />, label: "Engine type", value: listing.engine_type },
    { icon: <BikeIcon className="h-5 w-5" />, label: "Riding style", value: listing.riding_style },
    { icon: <PlaceIcon className="h-5 w-5" />, label: "Location", value: listing.town },
    { icon: <IdIcon className="h-5 w-5" />, label: "Licence", value: listing.licence_category },
  ];

  return (
    // Bottom padding on phones keeps the pinned contact bar off the last section.
    <main className="mx-auto max-w-[1280px] pb-28 sm:px-5 lg:pb-14">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-0">
        <Link href="/bikes" className="text-sm text-grey hover:text-gold-bright">
          ← Back to results
        </Link>
        <div className="flex items-center gap-5">
          <ShareButton url={listingUrl} title={bikeName} />
          <SaveButton listingId={listing.id} initiallySaved={isSaved} isLoggedIn={isLoggedIn} variant="inline" />
        </div>
      </div>

      {listing.status !== "active" && (
        <div className="mx-4 mb-4 rounded-md bg-red/20 px-3 py-2 text-sm text-gold-bright sm:mx-0">
          <p>This listing is {listing.status} — only you (or an admin) can see this page.</p>
          {listing.status === "rejected" && listing.rejection_reason && (
            <p className="mt-1 text-ink">Reason: {listing.rejection_reason}</p>
          )}
        </div>
      )}

      <PhotoGallery urls={photoUrls} alt={bikeName} />

      <div className="mt-4 grid gap-4 px-4 sm:px-0 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-6">
        <div className="space-y-4">
          <section className={`${card} p-5`}>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {isDealer ? <Badge>Verified dealer</Badge> : <Badge tone="muted">Private seller</Badge>}
              {listing.town && (
                <span className="flex items-center gap-1 text-sm text-grey">
                  <PinIcon className="h-3.5 w-3.5 fill-gold" />
                  {listing.town}
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl">{bikeName}</h1>
            {subtitle && <p className="mt-1 text-sm text-ink-dim">{subtitle}</p>}
            <div className="mt-4 border-t border-line pt-4">
              <p className="text-xs tracking-wide text-grey uppercase">Price</p>
              <p className="font-display text-4xl text-gold-bright">{price.main}</p>
              <p className="text-sm text-grey">{price.alt}</p>
            </div>
          </section>

          {/* On phones the contact card comes straight after the price. Card
              "Contact" buttons jump here; on desktop the sticky sidebar card
              is already on screen at this point. */}
          <div id="contact" className="scroll-mt-24" />
          <div className="lg:hidden">
            <ContactCard {...contactProps} />
          </div>

          <section className={`${card} p-5`}>
            <h2 className="font-display mb-4 text-xl">Overview</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
              {overview
                .filter((o) => o.value)
                .map((o) => (
                  <div key={o.label} className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-gold">{o.icon}</span>
                    <div>
                      <dt className="text-xs text-grey">{o.label}</dt>
                      <dd className="text-sm text-ink">{o.value}</dd>
                    </div>
                  </div>
                ))}
            </dl>
          </section>

          {listing.description && (
            <section className={`${card} p-5`}>
              <h2 className="font-display mb-3 text-xl">Description</h2>
              <p className="text-sm leading-relaxed whitespace-pre-line text-ink">{listing.description}</p>
            </section>
          )}

          <MeetTheSeller {...contactProps} />

          <section className={`${card} p-5`}>
            <h2 className="font-display mb-3 text-xl">Buying safely</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-dim">
              <li>See the bike in person, and ride it if you can, before any money changes hands.</li>
              <li>Check the registration papers and that the frame number matches them.</li>
              <li>Never pay a deposit by bank transfer to someone you haven&rsquo;t met.</li>
            </ul>
          </section>
        </div>

        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <ContactCard {...contactProps} />
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-10 px-4 sm:px-0">
          <SectionHeading
            action={
              <Link href={listing.riding_style ? `/bikes?style=${encodeURIComponent(listing.riding_style)}` : "/bikes"} className="text-sm text-gold-bright hover:underline">
                See all →
              </Link>
            }
          >
            Similar bikes
          </SectionHeading>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {similar.map((s) => (
              <ListingCard
                key={s.listing.id}
                listing={s.listing}
                currency="EUR"
                initiallySaved={s.saved}
                isLoggedIn={isLoggedIn}
                photoUrl={s.photoUrl}
                photoCount={s.photoCount}
                dealerName={s.dealerName}
              />
            ))}
          </div>
        </section>
      )}

      <MobileContactBar {...contactProps} />
    </main>
  );
}
