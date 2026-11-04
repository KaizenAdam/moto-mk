import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import PageHero from "@/app/components/PageHero";
import SectionHeading from "@/app/components/SectionHeading";
import { AD_SLOTS, type AdSlotId } from "@/lib/constants/monetisation";
import { CheckIcon, StoreIcon, WrenchIcon } from "@/app/components/icons";
import { button, card } from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Just5Up! for business",
  description:
    "Dealers, workshops, gear shops and insurers: sell bikes from your own storefront or advertise to motorcyclists across North Macedonia.",
};

const DEALER_PERKS = [
  "Your own storefront page, with your address, shop phone, a few words about you and every bike you have for sale",
  "A Verified dealer badge on your listings and storefront",
  "Your shop line shown to every buyer, with WhatsApp and Call buttons",
  "Listing bikes is free, the same as for private sellers",
];

const AD_STEPS = [
  ["Pick a slot", "Choose where you'd like to appear and for how long."],
  ["Send your artwork", "An image and the link people should land on."],
  ["We check it", "Every ad is reviewed before it goes live, like every listing."],
  ["You're live", "Your ad runs for the dates you booked."],
];

/**
 * Everything Just5Up! offers businesses, in one place (it used to be
 * /advertise, which redirects here). Kept out of the main nav on purpose:
 * the header is for riders, and the footer's "For business" column links
 * here, as Auto Trader does with its trade site. Ad booking and payment
 * aren't built yet (docs/HANDOVER-backend.md) and there's no enquiry
 * address until the client supplies one, so that call to action is
 * disabled rather than pointing somewhere made up.
 */
export default function ForBusinessPage() {
  return (
    <main className="pb-16">
      <PageHero
        width="narrow"
        title="Just5Up! for business"
        intro="Dealers, workshops, gear shops, insurers and importers: reach the people buying, riding and fixing motorcycles in North Macedonia."
      />

      <div className="mx-auto max-w-[1100px] space-y-16 px-5 pt-10">
        <nav aria-label="Ways to work with us" className="grid gap-4 md:grid-cols-3">
          <Route href="#dealers" icon={<StoreIcon className="h-6 w-6" />} title="Sell bikes as a dealer">
            A storefront and a verified badge for your stock.
          </Route>
          <Route href="#advertise" icon={<span className="font-display text-xl leading-none">AD</span>} title="Advertise your business">
            Banner spaces on the pages riders use most.
          </Route>
          <Route href="#service" icon={<WrenchIcon className="h-6 w-6" />} title="Get your workshop found">
            Service centres are listed on our map, free.
          </Route>
        </nav>

        <section id="dealers" className="scroll-mt-24">
          <SectionHeading>Sell bikes as a dealer</SectionHeading>
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_340px] md:items-start">
            <ul className="space-y-3">
              {DEALER_PERKS.map((perk) => (
                <li key={perk} className="flex gap-2.5 text-[15px] text-ink-dim">
                  <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-highlight" />
                  {perk}
                </li>
              ))}
            </ul>
            <div className="border border-line border-t-4 border-t-highlight bg-panel p-6">
              <p className="font-display text-2xl">How to apply</p>
              <p className="mt-2 text-sm text-ink-dim">
                Create an account, then request a dealer account from My Garage with your business name. We
                check every request before the storefront goes live.
              </p>
              <Link href="/garage#storefront" className={`${button("primary", "lg")} mt-5 w-full`}>
                Apply now &gt;&gt;&gt;
              </Link>
              <Link href="/dealers" className="mt-3 block text-center text-sm text-highlight hover:underline">
                See dealers already on Just5Up!
              </Link>
            </div>
          </div>
        </section>

        <section id="advertise" className="scroll-mt-24 space-y-10">
          <div>
            <SectionHeading>Advertise your business</SectionHeading>
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
          </div>

          <div>
            <h3 className="font-display mb-4 text-xl">How booking works</h3>
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {AD_STEPS.map(([title, body], i) => (
                <li key={title} className={`${card} p-5`}>
                  <span className="font-display text-3xl text-highlight">{i + 1}</span>
                  <p className="font-display mt-1 text-lg">{title}</p>
                  <p className="mt-1 text-sm text-ink-dim">{body}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col items-start gap-4 border border-line border-t-4 border-t-highlight bg-panel p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="font-display text-3xl">Ad booking opens soon</p>
              <p className="mt-1 text-sm text-ink-dim">Online booking and payment for ad spaces are on the way.</p>
            </div>
            <button type="button" disabled className={button("primary", "lg")}>
              Enquire
            </button>
          </div>
        </section>

        <section id="service" className="scroll-mt-24">
          <SectionHeading>Get your workshop found</SectionHeading>
          <div className={`${card} flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between`}>
            <p className="max-w-2xl text-[15px] text-ink-dim">
              Workshops, brand service centres and importers are listed on our service centres map for free,
              with Call, WhatsApp and directions. Online submissions are on the way; until then the Just5Up!
              team adds and checks each one.
            </p>
            <Link href="/service-centres" className={`${button("outline", "lg")} shrink-0`}>
              See the map
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

/** One of the three ways in, at the top of the page. */
function Route({ href, icon, title, children }: { href: string; icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <a href={href} className={`${card} group block p-5 transition hover:border-highlight`}>
      <span className="flex h-11 w-11 items-center justify-center bg-highlight text-[#111]">{icon}</span>
      <p className="font-display mt-4 text-xl group-hover:text-highlight">{title}</p>
      <p className="mt-1 text-sm text-ink-dim">{children}</p>
    </a>
  );
}

/** A tiny wireframe of the page with the ad's position in gold. */
function SlotDiagram({ slot }: { slot: AdSlotId }) {
  const bar = " bg-line";
  const ad = " bg-highlight/80";
  return (
    <div aria-hidden className="space-y-1.5 border border-line bg-black p-3">
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
