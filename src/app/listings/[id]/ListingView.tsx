import Link from "next/link";
import type { ReactNode } from "react";
import type { Tables } from "@/lib/database.types";
import { formatPrice } from "@/lib/constants/listings";
import {
  ArrowLeftIcon,
  BikeIcon,
  CalendarIcon,
  CheckIcon,
  EngineIcon,
  FuelIcon,
  GaugeIcon,
  IdIcon,
  PinIcon,
  PlaceIcon,
  ShieldIcon,
  StoreIcon,
  UserIcon,
  WarningIcon,
} from "@/app/components/icons";
import SaveButton from "@/app/components/SaveButton";
import ListingCard, { type ListingCardData } from "@/app/components/ListingCard";
import AdSlot from "@/app/components/AdSlot";
import { ContactCard, MeetTheSeller, MobileContactBar, type ContactProps } from "./ContactSeller";
import PhotoGallery from "./PhotoGallery";
import ShareButton from "./ShareButton";

const h2 = "font-display mb-4 text-2xl font-semibold";

const SAFETY_TIPS = [
  "See the bike in person, and ride it if you can, before any money changes hands.",
  "Check the registration papers and that the frame number matches them.",
  "Never pay a deposit by bank transfer to someone you haven\u2019t met.",
];

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
  similar: ListingCardData[];
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
    { icon: <CalendarIcon className="h-6 w-6" />, label: "Year", value: listing.year?.toString() ?? null },
    {
      icon: <GaugeIcon className="h-6 w-6" />,
      label: "Mileage",
      value: listing.mileage_km != null ? `${listing.mileage_km.toLocaleString("en-GB")} km` : null,
    },
    {
      icon: <EngineIcon className="h-6 w-6" />,
      label: "Engine size",
      value: listing.engine_cc != null ? `${listing.engine_cc.toLocaleString("en-GB")} cc` : null,
    },
    { icon: <FuelIcon className="h-6 w-6" />, label: "Engine type", value: listing.engine_type },
    { icon: <BikeIcon className="h-6 w-6" />, label: "Riding style", value: listing.riding_style },
    { icon: <PlaceIcon className="h-6 w-6" />, label: "Location", value: listing.town },
    { icon: <IdIcon className="h-6 w-6" />, label: "Licence", value: listing.licence_category },
  ];

  return (
    // Bottom padding on phones keeps the pinned contact bar off the last section.
    <main className="mx-auto max-w-[1280px] pb-28 sm:px-5 lg:pb-16">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-0">
        <Link href="/bikes" className="flex items-center gap-1.5 text-sm text-ink-dim hover:text-highlight">
          <ArrowLeftIcon />
          Back to results
        </Link>
        <div className="flex items-center gap-5">
          <ShareButton url={listingUrl} title={bikeName} />
          <SaveButton listingId={listing.id} initiallySaved={isSaved} isLoggedIn={isLoggedIn} variant="inline" />
        </div>
      </div>

      {listing.status !== "active" && (
        <div className="mx-4 mb-4 flex gap-2.5 border-l-4 border-red bg-red/15 px-4 py-3 text-sm sm:mx-0">
          <WarningIcon className="mt-0.5 h-4 w-4 shrink-0 text-red" />
          <div>
            <p>This listing is {listing.status} — only you (or an admin) can see this page.</p>
            {listing.status === "rejected" && listing.rejection_reason && (
              <p className="mt-1 text-ink-dim">Reason: {listing.rejection_reason}</p>
            )}
          </div>
        </div>
      )}

      <PhotoGallery urls={photoUrls} alt={bikeName} />

      <div className="mt-6 grid gap-8 px-4 sm:px-0 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-10">
        <div className="space-y-10">
          <section>
            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              {isDealer ? (
                <span className="font-display flex items-center gap-1.5 bg-highlight px-2 py-0.5 text-xs tracking-wider text-[#111]">
                  <StoreIcon className="h-3.5 w-3.5" />
                  Verified dealer
                </span>
              ) : (
                <span className="font-display flex items-center gap-1.5 border border-line px-2 py-0.5 text-xs tracking-wider text-ink-dim">
                  <UserIcon className="h-3.5 w-3.5" />
                  Private seller
                </span>
              )}
              {listing.town && (
                <span className="flex items-center gap-1 text-ink-dim">
                  <PinIcon />
                  {listing.town}
                </span>
              )}
            </div>
            <h1 className="font-display text-4xl leading-none sm:text-5xl">{bikeName}</h1>
            {subtitle && <p className="mt-2 text-ink-dim">{subtitle}</p>}
            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <span className="font-display bg-highlight px-3 py-1 text-4xl font-semibold text-[#111]">{price.main}</span>
              <span className="text-sm text-grey">{price.alt}</span>
            </div>
          </section>

          {/* On phones the contact card comes straight after the price. Card
              "Contact" buttons jump here; on desktop the sticky sidebar card
              is already on screen at this point. */}
          <div id="contact" className="scroll-mt-24" />
          <div className="lg:hidden">
            <ContactCard {...contactProps} />
          </div>

          <section>
            <h2 className={h2}>Overview</h2>
            <dl className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3">
              {overview
                .filter((o) => o.value)
                .map((o) => (
                  <div key={o.label} className="flex items-center gap-3 bg-panel px-4 py-4">
                    <span className="shrink-0 text-highlight">{o.icon}</span>
                    <div className="min-w-0">
                      <dt className="text-[11px] tracking-wider text-grey uppercase">{o.label}</dt>
                      <dd className="font-display truncate text-lg font-medium">{o.value}</dd>
                    </div>
                  </div>
                ))}
            </dl>
          </section>

          {listing.description && (
            <section>
              <h2 className={h2}>Description</h2>
              <p className="leading-relaxed whitespace-pre-line text-ink">{listing.description}</p>
            </section>
          )}

          <MeetTheSeller {...contactProps} />

          <section className="border-l-4 border-red bg-panel px-5 py-5">
            <h2 className="font-display mb-3 flex items-center gap-2 text-xl font-semibold">
              <ShieldIcon className="h-6 w-6 text-red" />
              Buying safely
            </h2>
            <ul className="space-y-2 text-sm text-ink-dim">
              {SAFETY_TIPS.map((t) => (
                <li key={t} className="flex gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-red" />
                  {t}
                </li>
              ))}
            </ul>
          </section>

          <div className="lg:hidden">
            <AdSlot slot="listing-sidebar" />
          </div>
        </div>

        <aside className="hidden space-y-5 lg:sticky lg:top-24 lg:block">
          <ContactCard {...contactProps} />
          <AdSlot slot="listing-sidebar" />
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-16 border-t-2 border-dashed border-[#2a2a2e] px-4 pt-12 sm:px-0">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 className="font-display text-[28px] font-semibold sm:text-[34px]">Similar bikes</h2>
            <Link
              href={listing.riding_style ? `/bikes?style=${encodeURIComponent(listing.riding_style)}` : "/bikes"}
              className="font-display shrink-0 border-2 border-red px-4 py-2 text-sm font-medium tracking-[.06em] transition hover:bg-red"
            >
              See all &gt;
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
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
