import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOwnProfile } from "@/lib/data/profiles";
import { listOwn } from "@/lib/data/listings";
import { listSaved } from "@/lib/data/savedListings";
import { listOwnRequests } from "@/lib/data/dealerRequests";
import { getCoverPhotoUrls } from "@/lib/data/listingPhotos";
import { formatPrice } from "@/lib/constants/listings";
import { deleteListingAction, markSoldAction } from "@/app/actions/garage";
import ActionButton from "@/app/components/ActionButton";
import ListingCard from "@/app/components/ListingCard";
import ProfileForm from "./ProfileForm";
import DealerRequestForm from "./DealerRequestForm";

const STATUS: Record<string, { label: string; className: string }> = {
  active: { label: "Live", className: "bg-green-700 text-white" },
  pending: { label: "Awaiting review", className: "bg-gold text-[#141414]" },
  rejected: { label: "Rejected", className: "bg-red text-white" },
  sold: { label: "Sold", className: "bg-panel2 text-ink-dim border border-line" },
  removed: { label: "Removed", className: "bg-panel2 text-ink-dim border border-line" },
  draft: { label: "Draft", className: "bg-panel2 text-ink-dim border border-line" },
};

const sectionTitle = "mb-4 border-b border-line pb-2.5 text-[15px] font-bold tracking-wide text-gold uppercase";

/** The signed-in user's own space: their listings, saved bikes and profile. */
export default async function GaragePage() {
  const supabase = await createClient();
  const [profile, mine, saved, dealerRequests] = await Promise.all([
    getOwnProfile(supabase),
    listOwn(supabase),
    listSaved(supabase),
    listOwnRequests(supabase),
  ]);
  if (!profile) redirect("/login");

  // Saved rows whose listing is no longer visible (sold, removed) come back
  // with listings = null under RLS — just leave them out.
  const savedListings = saved.flatMap((s) => (s.listings ? [s.listings] : []));
  const covers = await getCoverPhotoUrls(supabase, [
    ...mine.map((l) => l.id),
    ...savedListings.map((l) => l.id),
  ]);
  const pendingRequest = dealerRequests.find((r) => r.status === "pending");

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8 pb-16">
      <h1 className="font-display mb-1.5 text-3xl">My Garage</h1>
      <p className="mb-8 text-sm text-ink-dim">Your listings, saved bikes and profile.</p>

      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between border-b border-line pb-2.5">
          <h2 className="text-[15px] font-bold tracking-wide text-gold uppercase">
            My listings ({mine.length})
          </h2>
          <Link href="/sell" className="text-xs font-bold tracking-wide text-gold-bright uppercase hover:underline">
            + List a bike
          </Link>
        </div>
        {mine.length === 0 ? (
          <p className="text-sm text-ink-dim">You haven&rsquo;t listed a bike yet.</p>
        ) : (
          <div className="space-y-3">
            {mine.map((l) => {
              const status = STATUS[l.status] ?? STATUS.draft;
              const cover = covers.get(l.id);
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
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-gold-bright">{formatPrice(Number(l.price_eur), "EUR").main}</p>
                    {l.status === "rejected" && l.rejection_reason && (
                      <p className="mt-1 text-xs text-red">Reason: {l.rejection_reason} — edit it to resubmit.</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {l.status !== "sold" && (
                        <Link
                          href={`/listings/${l.id}/edit`}
                          className="rounded-md border border-line px-3 py-1.5 text-xs font-bold tracking-wide text-ink uppercase hover:border-gold"
                        >
                          Edit
                        </Link>
                      )}
                      {l.status === "active" && (
                        <ActionButton
                          action={markSoldAction.bind(null, l.id)}
                          label="Mark sold"
                          confirm="Mark this bike as sold? It will come off the site."
                        />
                      )}
                      <ActionButton
                        action={deleteListingAction.bind(null, l.id)}
                        label="Delete"
                        tone="danger"
                        confirm="Delete this listing and its photos for good?"
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
        <h2 className={sectionTitle}>Saved bikes ({savedListings.length})</h2>
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
                photoUrl={covers.get(l.id)}
              />
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <section>
          <h2 className={sectionTitle}>Profile</h2>
          <ProfileForm name={profile.name} phone={profile.phone} town={profile.town} />
        </section>

        <section>
          <h2 className={sectionTitle}>Dealer account</h2>
          {profile.account_type === "dealer" || profile.account_type === "admin" ? (
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
