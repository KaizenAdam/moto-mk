import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOwnProfile } from "@/lib/data/profiles";
import { listOwn } from "@/lib/data/listings";
import { listSaved } from "@/lib/data/savedListings";
import { listOwnRequests } from "@/lib/data/dealerRequests";
import { getOwnDealer } from "@/lib/data/dealers";
import { getCoverPhotos } from "@/lib/data/listingPhotos";
import { cachedPhotoSigner } from "@/lib/photos/signer";
import { formatPrice } from "@/lib/constants/listings";
import { deleteListingAction, markSoldAction } from "@/app/actions/garage";
import ActionButton from "@/app/components/ActionButton";
import ListingCard from "@/app/components/ListingCard";
import ProfileForm from "./ProfileForm";
import DealerRequestForm from "./DealerRequestForm";
import StorefrontForm from "./StorefrontForm";
import { button } from "@/app/components/ui";
import Badge, { type BadgeTone } from "@/app/components/Badge";
import EmptyState from "@/app/components/EmptyState";
import { BlockHero, Eyebrow, HighlightWord, RedBand } from "@/app/components/Bands";

const STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  active: { label: "Live", tone: "green" },
  pending: { label: "Awaiting review", tone: "gold" },
  rejected: { label: "Rejected", tone: "red" },
  sold: { label: "Sold", tone: "muted" },
  removed: { label: "Removed", tone: "muted" },
  draft: { label: "Draft", tone: "muted" },
};


/** The signed-in user's own space: their listings, saved bikes and profile. */
export default async function GaragePage() {
  const supabase = await createClient();
  const [profile, mine, saved, dealerRequests, dealer] = await Promise.all([
    getOwnProfile(supabase),
    listOwn(supabase),
    listSaved(supabase),
    listOwnRequests(supabase),
    getOwnDealer(supabase),
  ]);
  if (!profile) redirect("/login");

  // Saved rows whose listing is no longer visible (sold, removed) come back
  // with listings = null under RLS — just leave them out.
  const savedListings = saved.flatMap((s) => (s.listings ? [s.listings] : []));
  const covers = await getCoverPhotos(supabase, [
    ...mine.map((l) => l.id),
    ...savedListings.map((l) => l.id),
  ], cachedPhotoSigner(supabase));
  const pendingRequest = dealerRequests.find((r) => r.status === "pending");

  const live = mine.filter((l) => l.status === "active").length;
  const waiting = mine.filter((l) => l.status === "pending").length;
  const firstName = profile.name?.split(" ")[0];

  return (
    <main className="pb-16">
      <BlockHero
        compact
        shard={{ shape: "bent", className: "top-[-10%] right-[-120px] h-[160%] w-[420px] -scale-x-100 rotate-[12deg] bg-red/[.20] sm:right-[6%]" }}
        title={
          <>
            {firstName ? `${firstName}'s` : "My"}
            <br />
            <HighlightWord>garage</HighlightWord>
          </>
        }
        ticks={[
          `${live} live`,
          `${waiting} waiting for review`,
          `${savedListings.length} saved`,
        ]}
      >
        <div className="flex flex-wrap gap-2.5">
          <Link href="/sell" className={button("primary", "lg")}>
            Sell your bike &gt;&gt;&gt;
          </Link>
          <Link href="/feature" className={button("outline", "lg")}>
            Feature a bike
          </Link>
        </div>
      </BlockHero>

      <div className="mx-auto max-w-[1280px] space-y-14 px-5 pt-12">
        <section>
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="font-display text-[28px] font-semibold sm:text-[32px]">My listings ({mine.length})</h2>
            <Link href="/sell" className="font-display shrink-0 text-sm tracking-[.06em] text-highlight hover:underline">
              + List a bike
            </Link>
          </div>
          {mine.length === 0 ? (
            <EmptyState>
              You haven&rsquo;t listed a bike yet.{" "}
              <Link href="/sell" className="text-highlight hover:underline">
                List one free
              </Link>
            </EmptyState>
          ) : (
            <div className="space-y-3">
              {mine.map((l) => {
                const status = STATUS[l.status] ?? STATUS.draft;
                const cover = covers.get(l.id)?.url;
                return (
                  <div
                    key={l.id}
                    className={`flex flex-wrap gap-4 border border-line border-l-4 bg-panel p-3 sm:gap-5 ${
                      l.status === "active" ? "border-l-highlight" : "border-l-red"
                    }`}
                  >
                    <Link href={`/listings/${l.id}`} className="shrink-0">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element -- signed URL rotates per request
                        <img src={cover} alt="" className="h-24 w-32 object-cover" />
                      ) : (
                        <div className="flex h-24 w-32 items-center justify-center bg-panel2 text-xs text-grey">
                          No photo
                        </div>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/listings/${l.id}`}
                          className="font-display truncate text-xl leading-tight text-ink hover:text-highlight"
                        >
                          {l.title}
                        </Link>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </div>
                      <p className="mt-1.5">
                        <span className="font-display bg-highlight px-2 py-0.5 text-lg text-[#111]">
                          {formatPrice(Number(l.price_eur), "EUR").main}
                        </span>
                      </p>
                      {l.status === "rejected" && l.rejection_reason && (
                        <p className="mt-2 border-l-4 border-red bg-red/15 px-3 py-1.5 text-xs text-ink">
                          Reason: {l.rejection_reason} Edit it to resubmit.
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {l.status !== "sold" && (
                          <Link href={`/listings/${l.id}/edit`} className={button("outline", "sm")}>
                            Edit
                          </Link>
                        )}
                        {l.status === "active" && (
                          <Link href={`/listings/${l.id}/feature`} className={button("primary", "sm")}>
                            Feature this bike
                          </Link>
                        )}
                        {l.status === "active" && (
                          <ActionButton
                            action={markSoldAction.bind(null, l.id)}
                            label="Mark sold"
                            confirm="Mark this bike as sold? It will come off the site."
                            successMessage="Marked as sold"
                          />
                        )}
                        <ActionButton
                          action={deleteListingAction.bind(null, l.id)}
                          label="Delete"
                          tone="danger"
                          confirm="Delete this listing and its photos for good?"
                          successMessage="Listing deleted"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display mb-5 text-[28px] font-semibold sm:text-[32px]">
            Saved bikes ({savedListings.length})
          </h2>
          {savedListings.length === 0 ? (
            <EmptyState>
              Tap the heart on any bike to keep it here.{" "}
              <Link href="/bikes" className="text-highlight hover:underline">
                Browse bikes
              </Link>
            </EmptyState>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {savedListings.map((l) => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  currency="EUR"
                  initiallySaved
                  isLoggedIn
                  photoUrl={covers.get(l.id)?.url ?? undefined}
                  photoCount={covers.get(l.id)?.count ?? 0}
                />
              ))}
            </div>
          )}
        </section>

        <section className="max-w-[640px]">
          <h2 className="font-display mb-5 text-[28px] font-semibold sm:text-[32px]">Profile</h2>
          <div className="border border-line border-t-4 border-t-highlight bg-panel p-5 sm:p-6">
            <ProfileForm name={profile.name} phone={profile.phone} town={profile.town} />
          </div>
        </section>
      </div>

      <RedBand
        id="storefront"
        className="mt-16"
        shard={{ shape: "double", className: "top-[-80px] right-[-140px] h-[480px] w-[500px] -rotate-[14deg] bg-black/[.16]" }}
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <Eyebrow>For business</Eyebrow>
            <h2 className="font-display text-4xl leading-none sm:text-[44px]">
              {dealer ? "Your storefront" : "Sell as a dealer"}
            </h2>
            <p className="mt-3 max-w-md text-[15px]">
              {dealer ? (
                <>
                  What buyers see on your storefront page.{" "}
                  <Link href={`/dealers/${dealer.slug}`} className="underline">
                    View it
                  </Link>
                </>
              ) : (
                "A storefront, a Verified dealer badge and your shop line on every bike. We check every request."
              )}
            </p>
            {!dealer && (
              <Link href="/for-business#dealers" className="font-display mt-5 inline-block border-b-2 border-white tracking-[.06em]">
                What you get &gt;&gt;&gt;
              </Link>
            )}
          </div>
          <div className="bg-[#0a0a0a] p-5 sm:p-6">
            {dealer ? (
              <StorefrontForm dealer={dealer} />
            ) : profile.account_type === "dealer" || profile.account_type === "admin" ? (
              <p className="text-sm text-ink-dim">
                Your account is a <strong className="text-ink">{profile.account_type}</strong> account.
              </p>
            ) : pendingRequest ? (
              <p className="text-sm text-ink-dim">
                Your request for <strong className="text-ink">{pendingRequest.business_name}</strong> is being
                reviewed.
              </p>
            ) : (
              <DealerRequestForm />
            )}
          </div>
        </div>
      </RedBand>
    </main>
  );
}
