import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getById } from "@/lib/data/listings";
import { listForListing } from "@/lib/data/listingPhotos";
import { getOwnProfile, getPublicProfile } from "@/lib/data/profiles";
import { listSaved } from "@/lib/data/savedListings";
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

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        {listing.status !== "active" && (
          <p className="mb-4 rounded bg-amber-950 px-3 py-2 text-sm text-amber-400">
            This listing is {listing.status} — only you (or an admin) can see this page.
          </p>
        )}

        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-400">
              {listing.make} {listing.model}
            </h1>
            <p className="text-sm text-zinc-500">{listing.title}</p>
          </div>
          <SaveButton listingId={listing.id} initiallySaved={isSaved} isLoggedIn={!!profile} />
        </div>

        {photos.length > 0 ? (
          <div className="mb-6 grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <div key={p.id} className="aspect-square rounded bg-zinc-900" />
            ))}
          </div>
        ) : (
          <div className="mb-6 flex aspect-video items-center justify-center rounded bg-zinc-900 text-zinc-600">
            No photos yet
          </div>
        )}

        <p className="mb-6 text-3xl font-bold text-amber-400">
          €{Number(listing.price_eur).toLocaleString()}
        </p>

        <dl className="mb-6 grid grid-cols-2 gap-y-2 rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm sm:grid-cols-3">
          <Spec label="Year" value={listing.year} />
          <Spec label="Engine" value={listing.engine_cc ? `${listing.engine_cc}cc` : null} />
          <Spec label="Engine type" value={listing.engine_type} />
          <Spec label="Riding style" value={listing.riding_style} />
          <Spec label="Mileage" value={listing.mileage_km ? `${listing.mileage_km} km` : null} />
          <Spec label="Town" value={listing.town} />
          <Spec label="Licence" value={listing.licence_category} />
        </dl>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm">
          <p className="text-zinc-500">Seller</p>
          <p className="text-white">{seller.name ?? "—"}</p>
          <p className="text-zinc-500">{seller.town ?? ""}</p>
        </div>
      </div>
    </main>
  );
}

function Spec({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null) return null;
  return (
    <div>
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-white">{value}</dd>
    </div>
  );
}
