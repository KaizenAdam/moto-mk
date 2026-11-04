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
import { getI18n } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/format";
import ShopPhoto from "@/app/components/ShopPhoto";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [dealer, { t }] = await Promise.all([getBySlug(await createClient(), slug), getI18n()]);
  if (!dealer) return { title: t.storefront.notFound };
  return {
    title: `${dealer.business_name}${dealer.town ? `, ${dealer.town}` : ""}`,
    description: dealer.about?.slice(0, 160) ?? fill(t.storefront.metaDescription, { name: dealer.business_name }),
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

  const [listings, profile, saved, { t }] = await Promise.all([
    listActiveBySeller(supabase, dealer.profile_id),
    getOwnProfile(supabase),
    listSaved(supabase),
    getI18n(),
  ]);
  const covers = await getCoverPhotos(
    supabase,
    listings.map((l) => l.id),
    cachedPhotoSigner(supabase),
  );

  const wa = dealer.phone
    ? whatsAppHref(dealer.phone, fill(t.storefront.whatsappMessage, { name: dealer.business_name }))
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
        shard={{
          shape: "double",
          className: "top-[-20%] right-[-120px] h-[140%] w-[320px] -rotate-[16deg] bg-red/[.20] sm:right-[16%]",
        }}
        above={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dealers"
              className="inline-flex items-center gap-1.5 text-sm text-[#bdbab2] hover:text-highlight"
            >
              <ArrowLeftIcon />
              {t.storefront.allDealers}
            </Link>
            <Badge size="md">{t.common.verifiedDealer}</Badge>
          </div>
        }
        aside={<ShopPhoto name={dealer.business_name} className="aspect-[16/10] w-full border border-line" />}
        title={<HighlightWord>{dealer.business_name}</HighlightWord>}
        intro={dealer.about ? <span className="whitespace-pre-line">{dealer.about}</span> : undefined}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          {(dealer.address || dealer.town) && (
            <span className="flex items-center gap-1.5 text-[15px] text-[#d6d3cb]">
              <PinIcon className="h-4 w-4 text-highlight" />
              {mapUrl ? (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-highlight hover:underline"
                >
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
                  {t.common.whatsapp}
                </a>
              )}
              {tel && dealer.phone && (
                <a href={tel} className={button("outline", "lg")}>
                  {fill(t.common.callNumber, { phone: formatPhone(dealer.phone) })}
                </a>
              )}
            </div>
          )}
          {isOwner && (
            <Link href="/garage#storefront" className="text-sm text-highlight hover:underline">
              {t.storefront.editStorefront}
            </Link>
          )}
        </div>
      </BlockHero>

      {listings.length === 0 ? (
        <div className="mx-auto max-w-[1280px] px-5 py-10">
          <div className="border border-dashed border-line px-5 py-10 text-center text-sm text-ink-dim">
            {fill(t.storefront.noBikes, { name: dealer.business_name })}
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
