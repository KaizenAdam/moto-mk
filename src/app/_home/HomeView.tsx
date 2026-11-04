import Link from "next/link";
import type { Tables } from "@/lib/database.types";
import AdSlot from "@/app/components/AdSlot";
import Shard from "@/app/components/Shard";
import { HighlightWord } from "@/app/components/Bands";
import { getI18n } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { fill, formatDate, formatNumber, plural } from "@/lib/i18n/format";

export type StyleTile = { style: string; count: number; coverUrl: string | null };
export type HomeBike = { listing: Tables<"listings">; photoUrl?: string };

/**
 * The home page ("R3 · Combo", Oct 2026): a black-and-white hero with a
 * torn edge, angled bike-type tiles, the latest bikes, a red band for events
 * and the service side of the site, and a gold sell banner. Gold marks what
 * you can buy or do, red marks riding and attention. Markup only; page.tsx
 * fetches.
 */
export default async function HomeView({
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
  const { locale, t } = await getI18n();
  const h = t.home;
  return (
    <main className="pb-16">
      <Hero h={h} />

      <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
        <section className="pt-14 lg:pt-20">
          <h2 className="font-display mb-5 text-[28px] font-semibold sm:text-[32px]">{h.browseByType}</h2>
          <div className="grid grid-cols-3 gap-1.5 lg:grid-cols-6">
            {styles.map((s) => (
              <Link
                key={s.style}
                href={`/bikes?style=${encodeURIComponent(s.style)}`}
                className="group relative block aspect-[4/5] overflow-hidden bg-panel2 [clip-path:polygon(18%_0,100%_0,82%_100%,0_100%)]"
              >
                {s.coverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- signed URL
                  <img
                    src={s.coverUrl}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover brightness-[.55] grayscale transition duration-300 group-hover:scale-105 group-hover:brightness-75"
                  />
                )}
                <span className="font-display absolute bottom-3 left-[16%] bg-highlight px-1.5 py-0.5 text-xs sm:bottom-4 sm:left-[22%] sm:px-2.5 sm:text-[17px] text-[#111]">
                  {t.styles[s.style] ?? s.style}
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
                {latestAreFeatured ? h.featuredBikes : h.latestBikes}
              </h2>
              <Link
                href="/bikes"
                className="font-display shrink-0 border-2 border-red px-4 py-2 text-sm font-medium tracking-[.06em] transition hover:bg-red"
              >
                {fill(h.seeAllCount, { n: formatNumber(locale, totalBikes) })}
              </Link>
            </div>
            {/* Phones: a sideways-scrolling row rather than the cards stacked. */}
            <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-7 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
              {latest.map((b) => (
                <div key={b.listing.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
                  <BikeCard bike={b} locale={locale} noPhoto={t.common.noPhotoYet} />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="pt-14">
          <AdSlot slot="home-banner" />
        </div>
      </div>

      <RedBand events={events} serviceCentreCount={serviceCentreCount} t={t} locale={locale} />

      <section className="mx-auto mt-16 max-w-[1280px] px-4 sm:px-8 lg:mt-20">
        <div className="relative overflow-hidden bg-highlight px-6 py-9 text-[#111] sm:px-12 sm:py-11">
          <Shard className="inset-y-0 right-0 hidden w-[46%] bg-[#111] opacity-90 md:block" />
          <div className="relative max-w-[620px]">
            <h2 className="font-display text-4xl leading-none sm:text-5xl">{h.sellTitle}</h2>
            <p className="mt-3 text-[17px] leading-normal">{h.sellBody}</p>
            <Link
              href="/sell"
              className="font-display mt-5 inline-block bg-[#111] px-6 py-3.5 font-semibold tracking-[.08em] text-white outline-[3px] outline-offset-[3px] outline-red outline-solid transition hover:bg-black"
            >
              {h.sellButton}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Hero({ h }: { h: Dictionary["home"] }) {
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
        <h1 className="font-display max-w-[640px] text-[52px] leading-[1.08] sm:text-7xl lg:max-w-[560px] lg:text-[80px]">
          {h.heroTitle1}
          <br />
          <HighlightWord>{h.heroTitle2}</HighlightWord>
        </h1>
        <ul className="mt-7 grid max-w-[560px] grid-cols-2 gap-x-7 gap-y-2.5 text-sm text-[#d6d3cb] sm:text-base lg:max-w-[500px]">
          {h.ticks.map((tick) => (
            <li key={tick} className="flex gap-2.5">
              <span aria-hidden="true" className="font-bold text-[#ff6b70]">
                ✓
              </span>
              {tick}
            </li>
          ))}
        </ul>
        <form action="/bikes" method="GET" className="mt-9 flex max-w-[580px] bg-white">
          <label htmlFor="home-search" className="sr-only">
            {h.searchLabel}
          </label>
          <input
            id="home-search"
            type="text"
            name="search"
            placeholder={h.searchPlaceholder}
            className="min-w-0 flex-1 border-0 px-4 py-4 text-base text-[#111] outline-none placeholder:text-[#77767c] sm:px-5 sm:py-[18px]"
          />
          <button
            type="submit"
            className="font-display bg-highlight px-4 text-base font-semibold tracking-[.08em] text-[#111] transition hover:brightness-110 sm:px-6"
          >
            {h.searchButton}
            <span className="hidden sm:inline"> &gt;&gt;&gt;</span>
          </button>
        </form>
      </div>
    </section>
  );
}

function BikeCard({
  bike: { listing: l, photoUrl },
  locale,
  noPhoto,
}: {
  bike: HomeBike;
  locale: Locale;
  noPhoto: string;
}) {
  const specs = [
    l.engine_cc ? `${formatNumber(locale, l.engine_cc)}cc` : null,
    l.mileage_km != null ? `${formatNumber(locale, l.mileage_km)} km` : null,
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
          <div className="flex h-full items-center justify-center text-sm text-grey">{noPhoto}</div>
        )}
      </div>
      <p className="font-display mt-3.5 mb-0.5 truncate text-xl font-normal group-hover:text-highlight">
        {[l.year, l.make, l.model].filter(Boolean).join(" ")}
      </p>
      <p className="truncate text-sm text-grey">{specs.join(" · ")}</p>
      <p className="mt-2.5">
        <span className="font-display bg-highlight px-2.5 py-0.5 text-[22px] font-normal text-[#111]">
          €{formatNumber(locale, l.price_eur)}
        </span>
      </p>
    </Link>
  );
}

const bandRow = "flex items-center justify-between gap-4 border-t-2 border-white/35 py-[18px] text-white";

/** Red, full width: what's on (events) and what keeps a bike going. */
function RedBand({
  events,
  serviceCentreCount,
  t,
  locale,
}: {
  events: Tables<"events">[];
  serviceCentreCount: number;
  t: Dictionary;
  locale: Locale;
}) {
  const h = t.home;
  return (
    <section className="relative mt-16 overflow-hidden bg-red text-white lg:mt-20">
      <Shard className="top-[-40px] left-[-140px] h-[560px] w-[520px] -rotate-[4deg] bg-black/[.16]" />
      <div className="relative mx-auto grid max-w-[1280px] gap-12 px-4 py-14 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:py-16">
        <div>
          <p className="font-display mb-1.5 text-[13px] font-normal tracking-[.2em]">{h.ride}</p>
          <h2 className="font-display mb-5 text-4xl leading-none sm:text-[44px]">{h.upcomingEvents}</h2>
          {events.length === 0 ? (
            <p className="border-2 border-dashed border-white/55 px-5 py-4">{h.noEvents}</p>
          ) : (
            <ol className="space-y-3">
              {events.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/events#event-${e.id}`}
                    className="flex items-center gap-5 bg-[#0a0a0a] px-5 py-[18px] transition hover:bg-black"
                  >
                    <BandDate date={e.event_date} locale={locale} tbc={t.eventDate.tbc} />
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
            {h.fullCalendar}
          </Link>
        </div>

        <div>
          <p className="font-display mb-1.5 text-[13px] font-normal tracking-[.2em]">{h.fixKit}</p>
          <h2 className="font-display mb-5 text-4xl leading-none sm:text-[44px]">{h.keepRolling}</h2>
          <Link href="/service-centres" className={`${bandRow} group`}>
            <span className="font-display text-[22px] font-normal group-hover:underline">{h.serviceCentres}</span>
            <span>{serviceCentreCount > 0 ? plural(locale, serviceCentreCount, h.workshops) : h.findWorkshop}</span>
          </Link>
          <Link href="/parts-gear" className={`${bandRow} group`}>
            <span className="font-display text-[22px] font-normal group-hover:underline">{h.partsGear}</span>
            <span>{t.common.comingSoon}</span>
          </Link>
          {/* No forum page exists yet, so this row isn't a link. */}
          <div className={`${bandRow} border-b-2`}>
            <span className="font-display text-[22px] font-normal">{h.forum}</span>
            <span>{t.common.comingSoon}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function BandDate({ date, locale, tbc }: { date: string | null; locale: Locale; tbc: string }) {
  const d = date ? new Date(`${date}T00:00:00`) : null;
  return (
    <span className="w-[60px] shrink-0 text-center">
      {d ? (
        <>
          <span className="font-display block text-4xl leading-none font-normal text-highlight">{d.getDate()}</span>
          <span className="block text-xs tracking-[.1em] text-[#bdbab2] uppercase">
            {formatDate(locale, d, "monthShort")}
          </span>
        </>
      ) : (
        <span className="font-display block text-xl font-normal text-highlight">{tbc}</span>
      )}
    </span>
  );
}
