import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getById } from "@/lib/data/listings";
import { listForListing } from "@/lib/data/listingPhotos";
import { getOwnProfile, getPublicProfile } from "@/lib/data/profiles";
import { listSaved } from "@/lib/data/savedListings";
import { formatPrice } from "@/lib/constants/listings";
import { PinIcon } from "@/app/components/icons";
import SaveButton from "@/app/components/SaveButton";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const listing = await getById(supabase, id);
  if (!listing) notFound();

  const [seller, photos, profile] = await Promise.all([
    getPublicProfile(supabase, listing.seller_id),
    listForListing(supabase, listing.id),
    getOwnProfile(supabase),
  ]);

  const saved = profile ? await listSaved(supabase) : [];
  const isSaved = saved.some((s) => s.listing_id === listing.id);
  const price = formatPrice(Number(listing.price_eur), "EUR");

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <Link href="/listings" className="mb-4 inline-block text-sm text-grey hover:text-gold-bright">
        ← Back to listings
      </Link>

      {listing.status !== "active" && (
        <p className="mb-4 rounded-md bg-red/20 px-3 py-2 text-sm text-gold-bright">
          This listing is {listing.status} — only you (or an admin) can see this page.
        </p>
      )}

      <div className="overflow-hidden rounded-[10px] border border-line bg-panel">
        <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-[#26262b] to-[#18181b] text-sm text-grey">
          {photos.length === 0 ? "No photos yet" : `${photos.length} photo${photos.length > 1 ? "s" : ""}`}
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

          <div className="rounded-md border border-line bg-panel2 p-4 text-sm">
            <p className="text-ink-dim">Seller</p>
            <p className="text-ink">{seller.name ?? "—"}</p>
            {seller.town && <p className="text-grey">{seller.town}</p>}
          </div>
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
