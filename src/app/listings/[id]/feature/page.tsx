import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/auth";
import { getById } from "@/lib/data/listings";
import { getCoverPhotos } from "@/lib/data/listingPhotos";
import { getActiveBySeller } from "@/lib/data/dealers";
import { NotLiveNotice } from "./NotLiveNotice";
import FeatureForm from "./FeatureForm";

export const metadata: Metadata = { title: "Feature your bike", robots: { index: false } };

/**
 * Step one of paying to promote a listing: pick a package. Owner only.
 * Payment isn't built yet (docs/HANDOVER-backend.md), so the page ends at
 * a disabled "Continue to payment".
 */
export default async function FeatureListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [user, listing] = await Promise.all([getCurrentUser(supabase), getById(supabase, id)]);

  if (!user) redirect("/login");
  if (!listing || listing.seller_id !== user.id) notFound();

  const [covers, dealer] = await Promise.all([
    getCoverPhotos(supabase, [listing.id]),
    getActiveBySeller(supabase, listing.seller_id),
  ]);
  const cover = covers.get(listing.id);

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8 pb-16">
      <Link href="/garage" className="mb-4 inline-block text-sm text-grey hover:text-gold-bright">
        ← My Garage
      </Link>
      <h1 className="font-display mb-1.5 text-3xl sm:text-4xl">Get more buyers for your {listing.make}</h1>
      <p className="mb-8 max-w-2xl text-sm text-ink-dim">
        Featured bikes sit above ordinary listings in search, wear a gold frame and appear on the
        home page. A bump sends your bike back to the top of the newest listings.
      </p>

      {listing.status === "active" ? (
        <FeatureForm
          listing={listing}
          photoUrl={cover?.url ?? undefined}
          photoCount={cover?.count ?? 0}
          dealerName={dealer?.business_name}
        />
      ) : (
        <NotLiveNotice status={listing.status} />
      )}
    </main>
  );
}
