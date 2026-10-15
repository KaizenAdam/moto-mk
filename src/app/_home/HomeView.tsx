import Link from "next/link";
import type { Tables } from "@/lib/database.types";
import AdSlot from "@/app/components/AdSlot";
import Shard from "@/app/components/Shard";

export type StyleTile = { style: string; count: number; coverUrl: string | null };
export type HomeBike = { listing: Tables<"listings">; photoUrl?: string };

/**
 * The home page ("R3 · Combo", Oct 2026): a black-and-white hero with a
 * torn edge, angled bike-type tiles, the latest bikes, a red band for events
 * and the service side of the site, and a gold sell banner. Gold marks what
 * you can buy or do, red marks riding and attention. Markup only; page.tsx
 * fetches.
 */
export default function HomeView({
  totalBikes,
  styles,
  latest,
  latestAreFeatured,
  events,
  serviceCentreCount,
}: {
  totalBikes: number;
  styles: StyleTile[];
  latest: HomeBike[];
  /** True once paid featured listings exist; until then the row is "Latest bikes". */
  latestAreFeatured: boolean;
  /** Upcoming events, soonest first, already trimmed to what the band shows. */
  events: Tables<"events">[];
  serviceCentreCount: number;
}) {
  return (
    <main className="pb-16">
      <Hero />

      <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
        <section className="pt-14 lg:pt-20">
          <h2 className="font-display mb-5 text-[28px] font-semibold sm:text-[32px]">Browse by type</h2>
          <div className="grid grid-cols-3 gap-1.5 lg:grid-cols-6">
            {styles.map((t) => (
              <Link
                key={t.style}
                href={`/bikes?style=${encodeURIComponent(t.style)}`}
                className="group relative block aspect-[4/5] overflow-hidden bg-panel2 [clip-path:polygon(18%_0,100%_0,82%_100%,0_100%)]"
              >
                {t.coverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- signed URL
                  <img
                    src={t.coverUrl}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover brightness-[.55] grayscale transition duration-300 group-hover:scale-105 group-hover:brightness-75"
                  />
                )}
                <span className="font-display absolute top-2 left-[30%] text-lg sm:top-3 sm:text-[22px] font-normal text-white">
                  {t.count}
                </span>
                <span className="font-display absolute bottom-3 left-[16%] bg-highlight px-1.5 py-0.5 text-xs sm:bottom-4 sm:left-[22%] sm:px-2.5 sm:text-[17px] text-[#111]">
                  {t.style}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-14 border-t-2 border-dashed border-[#2a2a2e] lg:mt-[72px]" />

        {latest.length > 0 && (
          <section className="pt-14">
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <h2 className="font-display text-[28px] font-semibold sm:text-[34px]">
                {latestAreFeatured ? "Featured bikes" : "Latest bikes"}
              </h2>
              <Link
                href="/bikes"
                className="font-display shrink-0 border-2 border-red px-4 py-2 text-sm font-medium tracking-[.06em] transition hover:bg-red"
              >
                See all {totalBikes} &gt;
              </Link>
            </div>
            {/* Phones: a sideways-scrolling row rather than the cards stacked. */}
            <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-7 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
              {latest.map((b) => (
                <div key={b.listing.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
                  <BikeCard bike={b} />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="pt-14">
          <AdSlot slot="home-banner" />
        </div>
      </div>

      <RedBand events={events} serviceCentreCount={serviceCentreCount} />

      <section className="mx-auto mt-16 max-w-[1280px] px-4 sm:px-8 lg:mt-20">
        <div className="relative overflow-hidden bg-highlight px-6 py-9 text-[#111] sm:px-12 sm:py-11">
          <Shard className="inset-y-0 right-0 hidden w-[46%] bg-[#111] opacity-90 md:block" />
          <div className="relative max-w-[620px]">
            <h2 className="font-display text-4xl leading-none sm:text-5xl">Sell your bike today</h2>
            <p className="mt-3 text-[17px] leading-normal">
              Free to list, checked before it goes live, and seen by riders all over North Macedonia.
            </p>
            <Link
              href="/sell"
              className="font-display mt-5 inline-block bg-[#111] px-6 py-3.5 font-semibold tracking-[.08em] text-white outline-[3px] outline-offset-[3px] outline-red outline-solid transition hover:bg-black"
            >
              List it free &gt;&gt;&gt;
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const TICKS = ["Bikes only — no junk", "Every listing checked", "Riders & verified dealers", "Free to list"];

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#141416] lg:h-[580px]">
      {/* Static brand photo. Phones: a faint full-bleed backdrop; desktop: the
          right-hand 62% with a torn left edge (.j5-hero-photo in globals.css). */}
      {/* eslint-disable-next-line @next/next/no-img-element -- one static, pre-sized brand image */}
      <img
        src="/brand/hero-bike.jpg"
        width={1200}
        height={800}
        alt=""
        fetchPriority="high"
        className="j5-hero-photo absolute inset-0 h-full w-full object-cover opacity-25 contrast-[1.1] grayscale"
      />
      <div className="relative mx-auto max-w-[1280px] px-4 pt-14 pb-12 sm:px-8 lg:pt-24 lg:pb-0">
        <h1 className="font-display max-w-[640px] text-[52px] leading-none sm:text-7xl lg:text-[80px]">
          Find your
          <br />
          <span className="mt-2 inline-block bg-highlight px-3 pb-1 text-[#111]">next ride</span>
        </h1>
        <ul className="mt-7 grid max-w-[560px] grid-cols-2 gap-x-7 gap-y-2.5 text-sm text-[#d6d3cb] sm:text-base">
          {TICKS.map((t) => (
            <li key={t} className="flex gap-2.5">
              <span aria-hidden="true" className="font-bold text-[#ff6b70]">
                ✓
              </span>
              {t}
            </li>
          ))}
        </ul>
        <form action="/bikes" method="GET" className="mt-9 flex max-w-[580px] bg-white">
          <label htmlFor="home-search" className="sr-only">
            Search bikes
          </label>
          <input
            id="home-search"
            type="text"
            name="search"
            placeholder="Make or model — e.g. Yamaha MT-07"
            className="min-w-0 flex-1 border-0 px-4 py-4 text-base text-[#111] outline-none placeholder:text-[#77767c] sm:px-5 sm:py-[18px]"
          />
          <button
            type="submit"
            className="font-display bg-highlight px-4 text-base font-semibold tracking-[.08em] text-[#111] transition hover:brightness-110 sm:px-6"
          >
            Search<span className="hidden sm:inline"> &gt;&gt;&gt;</span>
          </button>
        </form>
      </div>
    </section>
  );
}

function BikeCard({ bike: { listing: l, photoUrl } }: { bike: HomeBike }) {
  const specs = [
    l.engine_cc ? `${l.engine_cc.toLocaleString("en-GB")}cc` : null,
    l.mileage_km != null ? `${l.mileage_km.toLocaleString("en-GB")} km` : null,
    l.town,
  ].filter(Boolean);

  return (
    <Link href={`/listings/${l.id}`} className="group block">
      <div className="aspect-[4/3] overflow-hidden bg-panel2">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- signed URL
          <img
            src={photoUrl}
            alt={l.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-grey">No photo yet</div>
        )}
      </div>
      <p className="font-display mt-3.5 mb-0.5 truncate text-xl font-normal group-hover:text-highlight">
        {[l.year, l.make, l.model].filter(Boolean).join(" ")}
      </p>
      <p className="truncate text-sm text-grey">{specs.join(" · ")}</p>
      <p className="mt-2.5">
        <span className="font-display bg-highlight px-2.5 py-0.5 text-[22px] font-normal text-[#111]">
          €{l.price_eur.toLocaleString("en-GB")}
        </span>
      </p>
    </Link>
  );
}

const bandRow = "flex items-center justify-between gap-4 border-t-2 border-white/35 py-[18px] text-white";

/** Red, full width: what's on (events) and what keeps a bike going. */
function RedBand({ events, serviceCentreCount }: { events: Tables<"events">[]; serviceCentreCount: number }) {
  return (
    <section className="relative mt-16 overflow-hidden bg-red text-white lg:mt-20">
      <Shard className="top-[-40px] left-[-140px] h-[560px] w-[520px] -rotate-[4deg] bg-black/[.16]" />
      <div className="relative mx-auto grid max-w-[1280px] gap-12 px-4 py-14 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:py-16">
        <div>
          <p className="font-display mb-1.5 text-[13px] font-normal tracking-[.2em]">Ride</p>
          <h2 className="font-display mb-5 text-4xl leading-none sm:text-[44px]">Upcoming events</h2>
          {events.length === 0 ? (
            <p className="border-2 border-dashed border-white/55 px-5 py-4">
              Nothing on the calendar yet. Rallies, track days and group rides will show up here.
            </p>
          ) : (
            <ol className="space-y-3">
              {events.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/events#event-${e.id}`}
                    className="flex items-center gap-5 bg-[#0a0a0a] px-5 py-[18px] transition hover:bg-black"
                  >
                    <BandDate date={e.event_date} />
                    <span className="min-w-0">
                      <span className="font-display block truncate text-[22px] font-normal">{e.title}</span>
                      {(e.location || e.description) && (
                        <span className="mt-0.5 line-clamp-1 text-sm text-[#bdbab2]">
                          {[e.location, e.description].filter(Boolean).join(" · ")}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
          <Link
            href="/events"
            className="font-display mt-5 inline-block border-b-2 border-white font-normal tracking-[.06em]"
          >
            Full calendar &gt;&gt;&gt;
          </Link>
        </div>

        <div>
          <p className="font-display mb-1.5 text-[13px] font-normal tracking-[.2em]">Fix &amp; kit</p>
          <h2 className="font-display mb-5 text-4xl leading-none sm:text-[44px]">Keep it rolling</h2>
          <Link href="/service-centres" className={`${bandRow} group`}>
            <span className="font-display text-[22px] font-normal group-hover:underline">Service centres</span>
            <span>
              {serviceCentreCount > 0
                ? `${serviceCentreCount} workshop${serviceCentreCount === 1 ? "" : "s"} ›`
                : "Find a workshop ›"}
            </span>
          </Link>
          <Link href="/parts-gear" className={`${bandRow} group`}>
            <span className="font-display text-[22px] font-normal group-hover:underline">Parts &amp; gear</span>
            <span>Coming soon</span>
          </Link>
          {/* No forum page exists yet, so this row isn't a link. */}
          <div className={`${bandRow} border-b-2`}>
            <span className="font-display text-[22px] font-normal">Rider forum</span>
            <span>Coming soon</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function BandDate({ date }: { date: string | null }) {
  const d = date ? new Date(`${date}T00:00:00`) : null;
  return (
    <span className="w-[60px] shrink-0 text-center">
      {d ? (
        <>
          <span className="font-display block text-4xl leading-none font-normal text-highlight">{d.getDate()}</span>
          <span className="block text-xs tracking-[.1em] text-[#bdbab2] uppercase">
            {d.toLocaleDateString("en-GB", { month: "short" })}
          </span>
        </>
      ) : (
        <span className="font-display block text-xl font-normal text-highlight">TBC</span>
      )}
    </span>
  );
}
