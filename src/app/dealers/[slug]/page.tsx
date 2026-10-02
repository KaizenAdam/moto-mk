import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBySlug } from "@/lib/data/dealers";
import { listActiveBySeller } from "@/lib/data/listings";
import { getCoverPhotoUrls } from "@/lib/data/listingPhotos";
import { getOwnProfile } from "@/lib/data/profiles";
import { listSaved } from "@/lib/data/savedListings";
import { formatPhone, telHref, whatsAppHref } from "@/lib/contact/phone";
import { PinIcon } from "@/app/components/icons";
import ListingsGrid from "@/app/components/ListingsGrid";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dealer = await getBySlug(await createClient(), slug);
  if (!dealer) return { title: "Dealer not found — Just5Up!" };
  return {
    title: `${dealer.business_name}${dealer.town ? `, ${dealer.town}` : ""} — Just5Up!`,
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
  const covers = await getCoverPhotoUrls(
    supabase,
    listings.map((l) => l.id)
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
      <section
        className="border-b border-line px-5 py-9"
        style={{
          background:
            "radial-gradient(circle at 80% 0%, rgba(193,39,45,.18), transparent 55%), radial-gradient(circle at 10% 100%, rgba(212,175,55,.12), transparent 50%), #0e0e11",
        }}
      >
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Link href="/dealers" className="mb-3 inline-block text-sm text-grey hover:text-gold-bright">
              ← All dealers
            </Link>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl">{dealer.business_name}</h1>
              <span className="rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-bold text-[#141414] uppercase">
                Verified dealer
              </span>
            </div>
            {(dealer.address || dealer.town) && (
              <div className="mb-3 flex items-center gap-1.5 text-sm text-grey">
                <PinIcon className="h-3.5 w-3.5 fill-gold" />
                {mapUrl ? (
                  <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold-bright">
                    {dealer.address ?? dealer.town}
                  </a>
                ) : (
                  dealer.town
                )}
              </div>
            )}
            {dealer.about && (
              <p className="text-sm leading-relaxed whitespace-pre-line text-ink-dim">{dealer.about}</p>
            )}
            {isOwner && (
              <Link href="/garage#storefront" className="mt-3 inline-block text-sm text-gold-bright hover:underline">
                Edit your storefront
              </Link>
            )}
          </div>

          {(wa || tel) && (
            <div className="flex flex-wrap gap-2.5">
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-[#25D366] px-5 py-3 text-sm font-bold tracking-wide text-[#0b0b0d] uppercase hover:brightness-110"
                >
                  WhatsApp
                </a>
              )}
              {tel && dealer.phone && (
                <a
                  href={tel}
                  className="rounded-md border border-line px-5 py-3 text-sm font-bold tracking-wide text-ink uppercase hover:border-gold"
                >
                  Call {formatPhone(dealer.phone)}
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {listings.length === 0 ? (
        <div className="mx-auto max-w-[1280px] px-6 py-10">
          <div className="rounded-[10px] border border-dashed border-line px-5 py-10 text-center text-sm text-ink-dim">
            {dealer.business_name} has no bikes listed right now — get in touch to ask what&rsquo;s
            coming in.
          </div>
        </div>
      ) : (
        <ListingsGrid
          listings={listings}
          savedIds={saved.map((s) => s.listing_id)}
          isLoggedIn={!!profile}
          photoUrls={Object.fromEntries(covers)}
          sortSelect={null}
        />
      )}
    </main>
  );
}
