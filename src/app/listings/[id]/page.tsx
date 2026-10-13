import type { Metadata } from "next";
import { cache } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getById, listSimilar } from "@/lib/data/listings";
import { getCoverPhotos, listForListing } from "@/lib/data/listingPhotos";
import { cachedPhotoSigner } from "@/lib/photos/signer";
import { getOwnProfile, getPublicProfile, getSellerContact } from "@/lib/data/profiles";
import { listSaved } from "@/lib/data/savedListings";
import { getActiveBySeller, listActiveDealers } from "@/lib/data/dealers";
import { type ContactProps } from "./ContactSeller";
import ListingView from "./ListingView";

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

/** Fetches everything a bike's page shows; ListingView lays it out. */
export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const listing = await loadListing(id);
  if (!listing) notFound();

  const [seller, photos, profile, saved, contact, h, dealer, similar, dealers] = await Promise.all([
    getPublicProfile(supabase, listing.seller_id),
    listForListing(supabase, listing.id, cachedPhotoSigner(supabase)),
    getOwnProfile(supabase),
    listSaved(supabase),
    getSellerContact(supabase, listing.id),
    headers(),
    getActiveBySeller(supabase, listing.seller_id),
    listSimilar(supabase, listing),
    listActiveDealers(supabase),
  ]);
  const similarCovers = await getCoverPhotos(
    supabase,
    similar.map((l) => l.id),
    cachedPhotoSigner(supabase)
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${h.get("host")}`;
  const listingUrl = `${siteUrl}/listings/${listing.id}`;
  const bikeName = [listing.year, listing.make, listing.model].filter(Boolean).join(" ");
  const savedIds = new Set(saved.map((s) => s.listing_id));
  const dealerNames = new Map(dealers.map((d) => [d.profile_id, d.business_name]));

  const contactProps: ContactProps = {
    sellerName: seller?.name ?? null,
    sellerTown: seller?.town ?? null,
    contact,
    isLoggedIn: !!profile,
    isOwnListing: profile?.id === listing.seller_id,
    bikeName,
    listingUrl,
    editHref: `/listings/${listing.id}/edit`,
    dealer,
  };

  return (
    <ListingView
      listing={listing}
      bikeName={bikeName}
      listingUrl={listingUrl}
      photoUrls={photos.map((p) => p.url).filter((u): u is string => !!u)}
      isSaved={savedIds.has(listing.id)}
      isLoggedIn={!!profile}
      isDealer={!!dealer}
      contactProps={contactProps}
      similar={similar.map((l) => ({
        listing: l,
        saved: savedIds.has(l.id),
        photoUrl: similarCovers.get(l.id)?.url ?? undefined,
        photoCount: similarCovers.get(l.id)?.count ?? 0,
        dealerName: dealerNames.get(l.seller_id),
      }))}
    />
  );
}
