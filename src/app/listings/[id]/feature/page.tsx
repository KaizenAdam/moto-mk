import type { Metadata } from "next";
import Link from "next/link";
import { BlockHero, HighlightWord } from "@/app/components/Bands";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/auth";
import { getById } from "@/lib/data/listings";
import { getCoverPhotos } from "@/lib/data/listingPhotos";
import { getActiveBySeller } from "@/lib/data/dealers";
import { NotLiveNotice } from "./NotLiveNotice";
import FeatureForm from "./FeatureForm";
import { ArrowLeftIcon } from "@/app/components/icons";

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
    <main className="pb-16">
      <BlockHero
        compact
        above={
          <Link href="/garage" className="inline-flex items-center gap-1.5 text-sm text-[#bdbab2] hover:text-highlight">
            <ArrowLeftIcon />
            My Garage
          </Link>
        }
        shard={{
          shape: "bent",
          className: "top-[-35%] right-[-60px] h-[160%] w-[360px] -rotate-[20deg] bg-highlight/[.14] sm:right-[8%]",
        }}
        title={
          <>
            Get more
            <br />
            <HighlightWord>buyers</HighlightWord>
          </>
        }
        intro={`Featured bikes sit above ordinary listings in search, wear a gold frame and appear on the home page. A bump sends your ${listing.make} back to the top of the newest listings.`}
      />

      <div className="mx-auto max-w-[1100px] px-5 pt-10">
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
      </div>
    </main>
  );
}
