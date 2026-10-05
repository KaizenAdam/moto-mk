import Link from "next/link";
import type { Metadata } from "next";
import { cache } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getById } from "@/lib/data/listings";
import { listForListing } from "@/lib/data/listingPhotos";
import { cachedPhotoSigner } from "@/lib/photos/signer";
import { getOwnProfile, getPublicProfile, getSellerContact } from "@/lib/data/profiles";
import { listSaved } from "@/lib/data/savedListings";
import { getActiveBySeller } from "@/lib/data/dealers";
import { formatPrice } from "@/lib/constants/listings";
import { PinIcon } from "@/app/components/icons";
import SaveButton from "@/app/components/SaveButton";
import ContactSeller from "./ContactSeller";
import PhotoGallery from "./PhotoGallery";

// generateMetadata and the page both need the listing; cache() makes it one query per request.
const loadListing = cache(async (id: string) => getById(await createClient(), id));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await loadListing(id);
  if (!listing) return { title: "Listing not found" };

  const name = [listing.year, listing.make, listing.model].filter(Boolean).join(" ");
  const price = `€${Number(listing.price_eur).toLocaleString("en-GB")}`;
  const title = `${name} — ${price}${listing.town ? `, ${listing.town}` : ""}`;
  const specs = [
    listing.engine_cc != null ? `${listing.engine_cc}cc` : null,
    listing.mileage_km != null ? `${listing.mileage_km.toLocaleString("en-GB")} km` : null,
    listing.riding_style,
  ].filter(Boolean).join(" · ");
  const description = (listing.description?.replace(/\s+/g, " ").slice(0, 155) ||
    `${name} for sale${listing.town ? ` in ${listing.town}` : ""}${specs ? ` — ${specs}` : ""}. On Just5Up!, North Macedonia's motorcycle marketplace.`);

  return {
    title,
    description,
    // Only live listings should be indexed; the page itself is visible to
    // its seller/admins in other states.
    robots: listing.status === "active" ? undefined : { index: false },
    openGraph: { title, description, type: "website" },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const listing = await loadListing(id);
  if (!listing) notFound();

  const [seller, photos, profile, saved, contact, h, dealer] = await Promise.all([
    getPublicProfile(supabase, listing.seller_id),
    listForListing(supabase, listing.id, cachedPhotoSigner(supabase)),
    getOwnProfile(supabase),
    listSaved(supabase),
    getSellerContact(supabase, listing.id),
    headers(),
    getActiveBySeller(supabase, listing.seller_id),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${h.get("host")}`;
  const bikeName = [listing.year, listing.make, listing.model].filter(Boolean).join(" ");

  const isSaved = saved.some((s) => s.listing_id === listing.id);
  const price = formatPrice(Number(listing.price_eur), "EUR");

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <Link href="/" className="mb-4 inline-block text-sm text-grey hover:text-gold-bright">
        ← Back to listings
      </Link>

      {listing.status !== "active" && (
        <div className="mb-4 rounded-md bg-red/20 px-3 py-2 text-sm text-gold-bright">
          <p>This listing is {listing.status} — only you (or an admin) can see this page.</p>
          {listing.status === "rejected" && listing.rejection_reason && (
            <p className="mt-1 text-ink">Reason: {listing.rejection_reason}</p>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-[10px] border border-line bg-panel">
        <div className="relative">
          <PhotoGallery
            urls={photos.map((p) => p.url).filter((u): u is string => !!u)}
            alt={`${listing.make} ${listing.model}`}
          />
          <div className="absolute top-3 right-3">
            <SaveButton listingId={listing.id} initiallySaved={isSaved} isLoggedIn={!!profile} variant="badge" />
          </div>
        </div>

        <div className="p-5">
          <h1 className="font-display text-2xl">
            {listing.make} {listing.model}
          </h1>
          <p className="mb-3 text-sm text-ink-dim">{listing.title}</p>

          <div className="mb-4 text-3xl font-extrabold text-gold-bright">
            {price.main} <span className="ml-2 text-sm font-normal text-grey">{price.alt}</span>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {listing.engine_cc != null && <Spec>{listing.engine_cc}cc</Spec>}
            {listing.engine_type && <Spec>{listing.engine_type}</Spec>}
            {listing.riding_style && <Spec>{listing.riding_style}</Spec>}
            {listing.year != null && <Spec>{listing.year}</Spec>}
            {listing.mileage_km != null && <Spec>{listing.mileage_km.toLocaleString()} km</Spec>}
            {listing.licence_category && <Spec>Licence {listing.licence_category}</Spec>}
          </div>

          <div className="mb-5 flex items-center gap-1.5 text-sm text-grey">
            <PinIcon className="h-3.5 w-3.5 fill-gold" />
            {listing.town ?? "—"}
          </div>

          {listing.description && (
            <p className="mb-5 text-sm leading-relaxed whitespace-pre-line text-ink">
              {listing.description}
            </p>
          )}

          <ContactSeller
            sellerName={seller?.name ?? null}
            sellerTown={seller?.town ?? null}
            contact={contact}
            isLoggedIn={!!profile}
            isOwnListing={profile?.id === listing.seller_id}
            bikeName={bikeName}
            listingUrl={`${siteUrl}/listings/${listing.id}`}
            editHref={`/listings/${listing.id}/edit`}
            dealer={dealer}
          />
        </div>
      </div>
    </main>
  );
}

function Spec({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-line bg-panel2 px-2 py-1 text-xs text-ink-dim">{children}</span>
  );
}
