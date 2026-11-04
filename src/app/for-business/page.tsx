import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import type { ReactNode } from "react";
import Link from "next/link";
import { BlockHero, Eyebrow, GoldBanner, HighlightWord, RedBand, blackButton } from "@/app/components/Bands";
import { AD_SLOT_IDS, type AdSlotId } from "@/lib/constants/monetisation";
import { fill } from "@/lib/i18n/format";
import { StoreIcon, TickIcon, WrenchIcon } from "@/app/components/icons";
import { button } from "@/app/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.meta.businessTitle,
    description: t.meta.businessDescription,
  };
}

/**
 * Everything Just5Up! offers businesses, in one place (it used to be
 * /advertise, which redirects here). Kept out of the main nav on purpose:
 * the header is for riders, and the footer's "For business" column links
 * here, as Auto Trader does with its trade site. Ad booking and payment
 * aren't built yet (docs/HANDOVER-backend.md) and there's no enquiry
 * address until the client supplies one, so that call to action is
 * disabled rather than pointing somewhere made up.
 */
export default async function ForBusinessPage() {
  const { t } = await getI18n();
  const B = t.business;
  return (
    <main className="pb-16">
      <BlockHero
        gradient
        shard={{
          shape: "bent",
          className:
            "top-[-30%] right-[-110px] h-[150%] w-[380px] rotate-[22deg] bg-red/[.22] sm:right-[10%] sm:w-[460px]",
        }}
        title={
          <>
            {B.title1}
            <br />
            <HighlightWord>{B.title2}</HighlightWord>
          </>
        }
        intro={B.intro}
        ticks={B.ticks}
      >
        <nav aria-label={B.waysLabel} className="grid max-w-[900px] gap-3 sm:grid-cols-3">
          <Route href="#dealers" icon={<StoreIcon className="h-6 w-6" />} title={B.routeDealer}>
            {B.routeDealerBody}
          </Route>
          <Route
            href="#advertise"
            icon={<span className="font-display text-xl leading-none">{B.adBadge}</span>}
            title={B.routeAds}
          >
            {B.routeAdsBody}
          </Route>
          <Route href="#service" icon={<WrenchIcon className="h-6 w-6" />} title={B.routeWorkshop}>
            {B.routeWorkshopBody}
          </Route>
        </nav>
      </BlockHero>

      <section id="dealers" className="mx-auto max-w-[1280px] scroll-mt-24 px-5 pt-14">
        <h2 className="font-display mb-6 text-[28px] font-semibold sm:text-[34px]">{B.dealersTitle}</h2>
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_380px] md:items-start">
          <ul className="space-y-3">
            {B.dealerPerks.map((perk) => (
              <li
                key={perk}
                className="flex items-center gap-4 border border-line border-l-4 border-l-red bg-panel px-5 py-4"
              >
                <TickIcon className="h-5 w-5 shrink-0 text-highlight" />
                <span className="text-[15px] text-ink">{perk}</span>
              </li>
            ))}
          </ul>
          <div className="border border-line border-t-4 border-t-highlight bg-panel p-6">
            <p className="font-display text-2xl">{B.howToApply}</p>
            <p className="mt-2 text-sm text-ink-dim">{B.howToApplyBody}</p>
            <Link href="/garage#storefront" className={`${button("primary", "lg")} mt-5 w-full`}>
              {B.applyNow}
            </Link>
            <Link href="/dealers" className="mt-3 block text-center text-sm text-highlight hover:underline">
              {B.seeDealers}
            </Link>
          </div>
        </div>
      </section>

      <RedBand
        id="advertise"
        className="mt-16"
        shard={{
          shape: "double",
          className: "bottom-[-120px] left-[-200px] h-[560px] w-[600px] rotate-[8deg] bg-black/[.16]",
        }}
      >
        <Eyebrow>{B.advertise}</Eyebrow>
        <h2 className="font-display mb-6 text-4xl leading-none sm:text-[44px]">{B.whereAdAppears}</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {AD_SLOT_IDS.map((id) => (
            <div key={id} className="bg-[#0a0a0a] p-5">
              <SlotDiagram slot={id} />
              <h3 className="font-display mt-4 text-[22px] font-normal">{t.slots[id].name}</h3>
              <p className="mt-1 text-sm text-[#d6d3cb]">{t.slots[id].where}</p>
              <p className="mt-2 text-xs text-[#bdbab2]">{fill(B.artwork, { size: t.slots[id].size })}</p>
            </div>
          ))}
        </div>

        <h3 className="font-display mt-10 mb-4 text-2xl font-normal">{B.howBooking}</h3>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {B.adSteps.map(({ title, body }, i) => (
            <li key={title} className="border-t-2 border-white/35 pt-4">
              <span className="font-display text-4xl leading-none text-highlight">{i + 1}</span>
              <p className="font-display mt-2 text-xl font-normal">{title}</p>
              <p className="mt-1 text-sm">{body}</p>
            </li>
          ))}
        </ol>
      </RedBand>

      <section id="service" className="mx-auto max-w-[1280px] scroll-mt-24 px-5 pt-14">
        <h2 className="font-display mb-6 text-[28px] font-semibold sm:text-[34px]">{B.workshopTitle}</h2>
        <div className="flex flex-col items-start gap-5 border border-line border-l-4 border-l-red bg-panel p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-[15px] text-ink-dim">{B.workshopBody}</p>
          <Link href="/service-centres" className={`${button("outline", "lg")} shrink-0`}>
            {B.seeMap}
          </Link>
        </div>
      </section>

      <div className="mt-16">
        <GoldBanner
          title={B.bookingSoon}
          body={B.bookingSoonBody}
          shard={{
            shape: "double",
            className: "inset-y-0 right-[-6%] hidden w-[42%] rotate-180 bg-[#111] opacity-90 md:block",
          }}
          action={
            <button type="button" disabled className={`${blackButton} cursor-not-allowed opacity-60`}>
              {B.enquire}
            </button>
          }
        />
      </div>
    </main>
  );
}

/** One of the three ways in, at the top of the page. */
function Route({ href, icon, title, children }: { href: string; icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <a href={href} className="group flex items-start gap-3.5 bg-[#0a0a0a]/85 p-4 transition hover:bg-black">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-highlight text-[#111]">{icon}</span>
      <span>
        <span className="font-display block text-lg leading-tight group-hover:text-highlight">{title} &gt;</span>
        <span className="mt-0.5 block text-[13px] text-[#bdbab2]">{children}</span>
      </span>
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
