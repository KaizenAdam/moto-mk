import Link from "next/link";
import type { Metadata } from "next";
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
import { getI18n } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/format";

/** Badge colour per status; the labels are the dictionary's `garage.status`. */
const STATUS_TONE: Record<string, BadgeTone> = {
  active: "green",
  pending: "gold",
  rejected: "red",
  sold: "muted",
  removed: "muted",
  draft: "muted",
};

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.garageTitle, robots: { index: false } };
}

/** The signed-in user's own space: their listings, saved bikes and profile. */
export default async function GaragePage() {
  const supabase = await createClient();
  const [{ locale, t }, profile, mine, saved, dealerRequests, dealer] = await Promise.all([
    getI18n(),
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
  const covers = await getCoverPhotos(
    supabase,
    [...mine.map((l) => l.id), ...savedListings.map((l) => l.id)],
    cachedPhotoSigner(supabase),
  );
  const pendingRequest = dealerRequests.find((r) => r.status === "pending");

  const live = mine.filter((l) => l.status === "active").length;
  const waiting = mine.filter((l) => l.status === "pending").length;
  const firstName = profile.name?.split(" ")[0];
  const G = t.garage;

  return (
    <main className="pb-16">
      <BlockHero
        compact
        shard={{
          shape: "bent",
          className:
            "top-[-10%] right-[-120px] h-[160%] w-[420px] -scale-x-100 rotate-[12deg] bg-red/[.20] sm:right-[6%]",
        }}
        title={
          <>
            {fill((firstName ? G.titleNamed : G.titleMine)[0], { name: firstName ?? "" })}
            <br />
            <HighlightWord>
              {fill((firstName ? G.titleNamed : G.titleMine)[1], { name: firstName ?? "" })}
            </HighlightWord>
          </>
        }
        ticks={[
          fill(G.ticksLive, { n: live }),
          fill(G.ticksWaiting, { n: waiting }),
          fill(G.ticksSaved, { n: savedListings.length }),
        ]}
      >
        <div className="flex flex-wrap gap-2.5">
          <Link href="/sell" className={button("primary", "lg")}>
            {G.sellButton}
          </Link>
          <Link href="/feature" className={button("outline", "lg")}>
            {t.common.featureABike}
          </Link>
        </div>
      </BlockHero>

      <div className="mx-auto max-w-[1280px] space-y-14 px-5 pt-12">
        <section>
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="font-display text-[28px] font-semibold sm:text-[32px]">
              {fill(G.myListings, { n: mine.length })}
            </h2>
            <Link
              href="/sell"
              className="font-display shrink-0 text-sm tracking-[.06em] text-highlight hover:underline"
            >
              {G.listABike}
            </Link>
          </div>
          {mine.length === 0 ? (
            <EmptyState>
              {G.noListings}{" "}
              <Link href="/sell" className="text-highlight hover:underline">
                {G.listOneFree}
              </Link>
            </EmptyState>
          ) : (
            <div className="space-y-3">
              {mine.map((l) => {
                const tone = STATUS_TONE[l.status] ?? STATUS_TONE.draft;
                const statusLabel = G.status[l.status] ?? G.status.draft;
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
                          {G.noPhoto}
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
                        <Badge tone={tone}>{statusLabel}</Badge>
                      </div>
                      <p className="mt-1.5">
                        <span className="font-display bg-highlight px-2 py-0.5 text-lg text-[#111]">
                          {formatPrice(Number(l.price_eur), "EUR", locale).main}
                        </span>
                      </p>
                      {l.status === "rejected" && l.rejection_reason && (
                        <p className="mt-2 border-l-4 border-red bg-red/15 px-3 py-1.5 text-xs text-ink">
                          {fill(G.rejectedReason, { reason: l.rejection_reason })}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {l.status !== "sold" && (
                          <Link href={`/listings/${l.id}/edit`} className={button("outline", "sm")}>
                            {t.common.edit}
                          </Link>
                        )}
                        {l.status === "active" && (
                          <Link href={`/listings/${l.id}/feature`} className={button("primary", "sm")}>
                            {G.featureThis}
                          </Link>
                        )}
                        {l.status === "active" && (
                          <ActionButton
                            action={markSoldAction.bind(null, l.id)}
                            label={G.markSold}
                            confirm={G.markSoldConfirm}
                            successMessage={G.markedSold}
                          />
                        )}
                        <ActionButton
                          action={deleteListingAction.bind(null, l.id)}
                          label={t.common.delete}
                          tone="danger"
                          confirm={G.deleteConfirm}
                          successMessage={G.deleted}
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
            {fill(G.savedBikes, { n: savedListings.length })}
          </h2>
          {savedListings.length === 0 ? (
            <EmptyState>
              {G.noSaved}{" "}
              <Link href="/bikes" className="text-highlight hover:underline">
                {G.browseBikes}
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
          <h2 className="font-display mb-5 text-[28px] font-semibold sm:text-[32px]">{G.profile}</h2>
          <div className="border border-line border-t-4 border-t-highlight bg-panel p-5 sm:p-6">
            <ProfileForm name={profile.name} phone={profile.phone} town={profile.town} />
          </div>
        </section>
      </div>

      <RedBand
        id="storefront"
        className="mt-16"
        shard={{
          shape: "double",
          className: "top-[-80px] right-[-140px] h-[480px] w-[500px] -rotate-[14deg] bg-black/[.16]",
        }}
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <Eyebrow>{G.forBusiness}</Eyebrow>
            <h2 className="font-display text-4xl leading-none sm:text-[44px]">
              {dealer ? G.yourStorefront : G.sellAsDealer}
            </h2>
            <p className="mt-3 max-w-md text-[15px]">
              {dealer ? (
                <>
                  {G.storefrontIntro}{" "}
                  <Link href={`/dealers/${dealer.slug}`} className="underline">
                    {G.viewIt}
                  </Link>
                </>
              ) : (
                G.dealerPitch
              )}
            </p>
            {!dealer && (
              <Link
                href="/for-business#dealers"
                className="font-display mt-5 inline-block border-b-2 border-white tracking-[.06em]"
              >
                {G.whatYouGet}
              </Link>
            )}
          </div>
          <div className="bg-[#0a0a0a] p-5 sm:p-6">
            {dealer ? (
              <StorefrontForm dealer={dealer} />
            ) : profile.account_type === "dealer" || profile.account_type === "admin" ? (
              <p className="text-sm text-ink-dim">{fill(G.accountType, { type: profile.account_type })}</p>
            ) : pendingRequest ? (
              <p className="text-sm text-ink-dim">
                {fill(G.requestPending, { business: pendingRequest.business_name })}
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
