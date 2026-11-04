import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBySlug } from "@/lib/data/dealers";
import { listActiveBySeller } from "@/lib/data/listings";
import { getCoverPhotos } from "@/lib/data/listingPhotos";
import { cachedPhotoSigner } from "@/lib/photos/signer";
import { getOwnProfile } from "@/lib/data/profiles";
import { listSaved } from "@/lib/data/savedListings";
import { formatPhone, telHref, whatsAppHref } from "@/lib/contact/phone";
import { PinIcon, ArrowLeftIcon } from "@/app/components/icons";
import ListingsGrid from "@/app/components/ListingsGrid";
import Badge from "@/app/components/Badge";
import { button } from "@/app/components/ui";
import { BlockHero, HighlightWord } from "@/app/components/Bands";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dealer = await getBySlug(await createClient(), slug);
  if (!dealer) return { title: "Dealer not found" };
  return {
    title: `${dealer.business_name}${dealer.town ? `, ${dealer.town}` : ""}`,
    description:
      dealer.about?.slice(0, 160) ??
      `Motorcycles for sale from ${dealer.business_name} on Just5Up!, North Macedonia's motorcycle marketplace.`,
  };
}

/**
 * A dealer's public storefront. The business phone is public here by
 * design (it's a shop line, approved with the dealer request), unlike a
 * private seller's number, which only signed-in buyers get.
 */
export default async function DealerStorefrontPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const dealer = await getBySlug(supabase, slug);
  if (!dealer) notFound();

  const [listings, profile, saved] = await Promise.all([
    listActiveBySeller(supabase, dealer.profile_id),
    getOwnProfile(supabase),
    listSaved(supabase),
  ]);
  const covers = await getCoverPhotos(
    supabase,
    listings.map((l) => l.id),
    cachedPhotoSigner(supabase)
  );

  const wa = dealer.phone
    ? whatsAppHref(dealer.phone, `Hi ${dealer.business_name}, I found you on Just5Up!`)
    : null;
  const tel = dealer.phone ? telHref(dealer.phone) : null;
  const mapUrl = dealer.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dealer.address)}`
    : null;
  const isOwner = profile?.id === dealer.profile_id;

  return (
    <main>
      <BlockHero
        gradient
        compact
        shard={{ shape: "double", className: "top-[-20%] right-[-120px] h-[140%] w-[320px] -rotate-[16deg] bg-red/[.20] sm:right-[16%]" }}
        above={
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dealers" className="inline-flex items-center gap-1.5 text-sm text-[#bdbab2] hover:text-highlight">
              <ArrowLeftIcon />
              All dealers
            </Link>
            <Badge size="md">Verified dealer</Badge>
          </div>
        }
        title={<HighlightWord>{dealer.business_name}</HighlightWord>}
        intro={dealer.about ? <span className="whitespace-pre-line">{dealer.about}</span> : undefined}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          {(dealer.address || dealer.town) && (
            <span className="flex items-center gap-1.5 text-[15px] text-[#d6d3cb]">
              <PinIcon className="h-4 w-4 text-highlight" />
              {mapUrl ? (
                <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="hover:text-highlight hover:underline">
                  {dealer.address ?? dealer.town}
                </a>
              ) : (
                dealer.town
              )}
            </span>
          )}
          {(wa || tel) && (
            <div className="flex flex-wrap gap-2.5">
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className={button("whatsapp", "lg")}>
                  WhatsApp
                </a>
              )}
              {tel && dealer.phone && (
                <a href={tel} className={button("outline", "lg")}>
                  Call {formatPhone(dealer.phone)}
                </a>
              )}
            </div>
          )}
          {isOwner && (
            <Link href="/garage#storefront" className="text-sm text-highlight hover:underline">
              Edit your storefront
            </Link>
          )}
        </div>
      </BlockHero>

      {listings.length === 0 ? (
        <div className="mx-auto max-w-[1280px] px-5 py-10">
          <div className="border border-dashed border-line px-5 py-10 text-center text-sm text-ink-dim">
            {dealer.business_name} has no bikes listed right now — get in touch to ask what&rsquo;s
            coming in.
          </div>
        </div>
      ) : (
        <ListingsGrid
          listings={listings}
          savedIds={saved.map((s) => s.listing_id)}
          isLoggedIn={!!profile}
          photos={Object.fromEntries(covers)}
          sortSelect={null}
          dealerNames={{ [dealer.profile_id]: dealer.business_name }}
        />
      )}
    </main>
  );
}
