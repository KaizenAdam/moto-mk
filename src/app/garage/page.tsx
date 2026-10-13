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
import SectionHeading from "@/app/components/SectionHeading";

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

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8 pb-16">
      <h1 className="font-display mb-1.5 text-3xl sm:text-4xl">My Garage</h1>
      <p className="mb-8 text-sm text-ink-dim">Your listings, saved bikes and profile.</p>

      <section className="mb-12">
        <SectionHeading
          action={
            <Link href="/sell" className="text-sm text-gold-bright hover:underline">
              + List a bike
            </Link>
          }
        >
          My listings ({mine.length})
        </SectionHeading>
        {mine.length === 0 ? (
          <p className="text-sm text-ink-dim">You haven&rsquo;t listed a bike yet.</p>
        ) : (
          <div className="space-y-3">
            {mine.map((l) => {
              const status = STATUS[l.status] ?? STATUS.draft;
              const cover = covers.get(l.id)?.url;
              return (
                <div key={l.id} className="flex flex-wrap gap-4 rounded-[10px] border border-line bg-panel p-3">
                  <Link href={`/listings/${l.id}`} className="shrink-0">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element -- signed URL rotates per request
                      <img src={cover} alt="" className="h-20 w-28 rounded-md object-cover" />
                    ) : (
                      <div className="flex h-20 w-28 items-center justify-center rounded-md bg-panel2 text-xs text-grey">
                        No photo
                      </div>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/listings/${l.id}`} className="truncate font-bold text-ink hover:text-gold-bright">
                        {l.title}
                      </Link>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </div>
                    <p className="text-sm text-gold-bright">{formatPrice(Number(l.price_eur), "EUR").main}</p>
                    {l.status === "rejected" && l.rejection_reason && (
                      <p className="mt-1 text-xs text-red">Reason: {l.rejection_reason} — edit it to resubmit.</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {l.status !== "sold" && (
                        <Link
                          href={`/listings/${l.id}/edit`}
                          className={button("outline", "sm")}
                        >
                          Edit
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

      <section className="mb-12">
        <SectionHeading>Saved bikes ({savedListings.length})</SectionHeading>
        {savedListings.length === 0 ? (
          <p className="text-sm text-ink-dim">Tap the ♡ on any bike to keep it here.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <section>
          <SectionHeading>Profile</SectionHeading>
          <ProfileForm name={profile.name} phone={profile.phone} town={profile.town} />
        </section>

        <section id="storefront">
          <SectionHeading>{dealer ? "Your storefront" : "Dealer account"}</SectionHeading>
          {dealer ? (
            <StorefrontForm dealer={dealer} />
          ) : profile.account_type === "dealer" || profile.account_type === "admin" ? (
            <p className="text-sm text-ink-dim">
              Your account is a <strong className="text-ink">{profile.account_type}</strong> account.
            </p>
          ) : pendingRequest ? (
            <p className="text-sm text-ink-dim">
              Your request for <strong className="text-ink">{pendingRequest.business_name}</strong> is
              being reviewed.
            </p>
          ) : (
            <>
              <p className="mb-4 text-sm text-ink-dim">
                Sell bikes as a business? Request a dealer account — we check every request.
              </p>
              <DealerRequestForm />
            </>
          )}
        </section>
      </div>
    </main>
  );
}
