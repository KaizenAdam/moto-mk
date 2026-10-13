import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";
import SectionHeading from "@/app/components/SectionHeading";
import { AD_SLOTS, type AdSlotId } from "@/lib/constants/monetisation";
import { button, card } from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Advertise on Just5Up!",
  description:
    "Put your workshop, gear shop or insurance in front of motorcyclists across North Macedonia.",
};

/**
 * For businesses: where ads appear and how buying one will work. Payment
 * and self-serve booking aren't built yet (docs/HANDOVER-backend.md), and
 * there's no enquiry address until the client supplies one, so the call to
 * action is disabled rather than pointing somewhere made up.
 */
export default function AdvertisePage() {
  return (
    <main className="pb-16">
      <PageHero
        title="Advertise to riders"
        intro="Workshops, gear shops, insurers and importers: put your business in front of people who are buying, riding and fixing motorcycles in North Macedonia."
      />

      <div className="mx-auto max-w-[1100px] space-y-14 px-5 pt-10">
        <section>
          <SectionHeading>Where your ad appears</SectionHeading>
          <div className="grid gap-4 md:grid-cols-3">
            {(Object.keys(AD_SLOTS) as AdSlotId[]).map((id) => (
              <div key={id} className={`${card} p-5`}>
                <SlotDiagram slot={id} />
                <h3 className="font-display mt-4 text-xl">{AD_SLOTS[id].name}</h3>
                <p className="mt-1 text-sm text-ink-dim">{AD_SLOTS[id].where}</p>
                <p className="mt-2 text-xs text-grey">Artwork: {AD_SLOTS[id].size}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading>How it works</SectionHeading>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Pick a slot", "Choose where you'd like to appear and for how long."],
              ["Send your artwork", "An image and the link people should land on."],
              ["We check it", "Every ad is reviewed before it goes live, like every listing."],
              ["You're live", "Your ad runs for the dates you booked."],
            ].map(([title, body], i) => (
              <li key={title} className={`${card} p-5`}>
                <span className="font-display text-3xl text-gold">{i + 1}</span>
                <p className="font-display mt-1 text-lg">{title}</p>
                <p className="mt-1 text-sm text-ink-dim">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col items-start gap-4 rounded-[10px] border border-gold/40 bg-gradient-to-br from-gold/15 to-red/10 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="font-display text-3xl">Booking opens soon</h2>
            <p className="mt-1 text-sm text-ink-dim">
              Online booking and payment are on the way. Selling bikes as a business?{" "}
              <Link href="/garage#storefront" className="text-gold-bright hover:underline">
                Open a dealer storefront
              </Link>{" "}
              in the meantime.
            </p>
          </div>
          <button type="button" disabled className={button("primary", "lg")}>
            Enquire
          </button>
        </section>
      </div>
    </main>
  );
}

/** A tiny wireframe of the page with the ad's position in gold. */
function SlotDiagram({ slot }: { slot: AdSlotId }) {
  const bar = "rounded-sm bg-line";
  const ad = "rounded-sm bg-gold/80";
  return (
    <div aria-hidden className="space-y-1.5 rounded-md border border-line bg-black p-3">
      <div className={`${bar} h-2 w-1/3`} />
      {slot === "listing-sidebar" ? (
        <div className="grid grid-cols-[2fr_1fr] gap-1.5">
          <div className="space-y-1.5">
            <div className={`${bar} h-10`} />
            <div className={`${bar} h-3`} />
            <div className={`${bar} h-3 w-2/3`} />
          </div>
          <div className="space-y-1.5">
            <div className={`${bar} h-6`} />
            <div className={`${ad} h-10`} />
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`${bar} h-6`} />
            ))}
          </div>
          <div className={`${ad} ${slot === "home-banner" ? "h-6" : "h-4"}`} />
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`${bar} h-6`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
