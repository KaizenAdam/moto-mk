import Link from "next/link";
import type { ReactNode } from "react";
import type { Tables } from "@/lib/database.types";
import PageHero from "@/app/components/PageHero";
import SectionHeading from "@/app/components/SectionHeading";
import ListingCard, { type ListingCardData } from "@/app/components/ListingCard";
import AdSlot from "@/app/components/AdSlot";
import Badge from "@/app/components/Badge";
import { PinIcon } from "@/app/components/icons";
import EventDate from "@/app/components/EventDate";
import { button, card } from "@/app/components/ui";

export type StyleTile = { style: string; count: number; coverUrl: string | null };
export type DealerTile = { slug: string; business_name: string; town: string | null; stock: number };

/**
 * The home page, laid out like a dashboard for the whole riding scene:
 * live numbers across the top, bikes in the main column, and a right-hand
 * rail with the upcoming events feed, dealers and a sell prompt. On phones
 * the rail comes straight after the stats and bike types, so events aren't
 * buried at the bottom. Markup only; page.tsx fetches.
 */
export default function HomeView({
  stats,
  styles,
  latest,
  latestAreFeatured,
  events,
  serviceCentres,
  dealers,
  isLoggedIn,
}: {
  stats: { bikes: number; dealers: number; serviceCentres: number; events: number };
  styles: StyleTile[];
  latest: ListingCardData[];
  /** True once paid featured listings exist; until then the row is "Latest bikes". */
  latestAreFeatured: boolean;
  /** Upcoming events, soonest first (already trimmed to what the feed shows). */
  events: Tables<"events">[];
  serviceCentres: { count: number; towns: string[] };
  dealers: DealerTile[];
  isLoggedIn: boolean;
}) {
  return (
    <main className="pb-16">
      <PageHero
        title={
          <>
            Find your next ride in <em className="not-italic text-gold">North Macedonia</em>
          </>
        }
        intro="Bikes for sale from riders and trusted dealers, plus the workshops, events and people that keep North Macedonia riding."
      >
        <form action="/bikes" method="GET" className="flex max-w-3xl gap-2.5 rounded-lg border border-line bg-panel p-2">
          <input
            type="text"
            name="search"
            placeholder="Search make or model, e.g. Yamaha MT-07…"
            className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-[15px] text-ink outline-none placeholder:text-[#6f6f76]"
          />
          <button type="submit" className={button("primary")}>
            Search
          </button>
        </form>
      </PageHero>

      {/* Main column + right rail. Rows: [stats & types | rail] then [the rest | rail];
          on phones it stacks stats & types → rail → the rest. */}
      <div className="mx-auto grid max-w-[1280px] grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-10 px-4 pt-8 sm:px-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-[auto_1fr]">
        <div className="space-y-10 lg:col-start-1 lg:row-start-1">
          <section aria-label="Just5Up! in numbers" className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat value={stats.bikes} label="Bikes for sale" href="/bikes" />
            <Stat value={stats.dealers} label="Verified dealers" href="/dealers" />
            <Stat value={stats.serviceCentres} label="Service centres" href="/service-centres" />
            <Stat value={stats.events} label="Upcoming events" href="/events" />
          </section>

          <section>
            <SectionHeading>Browse by type</SectionHeading>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {styles.map((t) => (
                <Link
                  key={t.style}
                  href={`/bikes?style=${encodeURIComponent(t.style)}`}
                  className="group relative block aspect-[16/10] overflow-hidden rounded-[10px] border border-line bg-panel2 transition hover:border-gold"
                >
                  {t.coverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- signed URL
                    <img
                      src={t.coverUrl}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-300 group-hover:scale-105 group-hover:opacity-90"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="font-display text-xl text-ink group-hover:text-gold-bright">{t.style}</p>
                    <p className="text-xs text-ink-dim">
                      {t.count === 0 ? "None listed yet" : `${t.count} bike${t.count === 1 ? "" : "s"}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <EventsFeed events={events} total={stats.events} />

          {dealers.length > 0 && (
            <RailCard
              title="Dealers"
              action={
                <Link href="/dealers" className="text-sm text-gold-bright hover:underline">
                  All →
                </Link>
              }
            >
              <ul className="divide-y divide-line">
                {dealers.slice(0, 5).map((d) => (
                  <li key={d.slug}>
                    <Link href={`/dealers/${d.slug}`} className="group flex items-center gap-3 py-2.5">
                      <span className="font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-panel2 text-lg text-gold">
                        {d.business_name.charAt(0)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-ink group-hover:text-gold-bright">
                          {d.business_name}
                        </span>
                        <span className="block text-xs text-grey">
                          {[d.town, d.stock > 0 ? `${d.stock} bike${d.stock === 1 ? "" : "s"}` : null]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </RailCard>
          )}

          <div className="rounded-[10px] border border-gold/40 bg-gradient-to-br from-gold/15 to-red/10 p-5">
            <h2 className="font-display text-2xl">Got a bike to sell?</h2>
            <p className="mt-1 mb-4 text-sm text-ink-dim">
              List it free in a few minutes. Every listing is checked before it goes live.
            </p>
            <Link href="/sell" className={`${button("primary")} w-full`}>
              + List your bike free
            </Link>
          </div>
        </aside>

        <div className="space-y-10 lg:col-start-1 lg:row-start-2">
          {latest.length > 0 && (
            <section>
              <SectionHeading
                action={
                  <Link href="/bikes" className="text-sm text-gold-bright hover:underline">
                    See all bikes →
                  </Link>
                }
              >
                {latestAreFeatured ? "Featured bikes" : "Latest bikes"}
              </SectionHeading>
              {/* Phones: a sideways-scrolling row rather than the cards stacked. */}
              <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-3">
                {latest.map((c) => (
                  <div key={c.listing.id} className="w-[80%] shrink-0 snap-start sm:w-auto">
                    <ListingCard
                      listing={c.listing}
                      currency="EUR"
                      initiallySaved={c.saved}
                      isLoggedIn={isLoggedIn}
                      photoUrl={c.photoUrl}
                      photoCount={c.photoCount}
                      dealerName={c.dealerName}
                      featured={c.featured}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          <AdSlot slot="home-banner" />

          <section>
            <SectionHeading>More than bikes</SectionHeading>
            <div className="grid gap-4 sm:grid-cols-3">
              <HubCard title="Parts & Gear" href="/parts-gear" badge={<Badge tone="red">Coming soon</Badge>} cta="Take a look">
                <ul className="space-y-1">
                  <li>Spare parts &amp; accessories</li>
                  <li>Gear — helmets, jackets, boots</li>
                </ul>
              </HubCard>

              <HubCard title="Service Centres" href="/service-centres" cta="Find a workshop">
                <p>
                  <span className="font-display text-3xl text-gold-bright">{serviceCentres.count}</span>{" "}
                  workshops, brand service centres and importers
                </p>
                {serviceCentres.towns.length > 0 && (
                  <p className="mt-2 flex items-center gap-1.5 text-grey">
                    <PinIcon />
                    {serviceCentres.towns.join(", ")}
                  </p>
                )}
              </HubCard>

              <HubCard title="Rider Forum" href="/events" badge={<Badge tone="red">Coming soon</Badge>} cta="Meanwhile, ride with us">
                <p>Ask questions, swap stories and plan rides with riders across North Macedonia.</p>
              </HubCard>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Stat({ value, label, href }: { value: number; label: string; href: string }) {
  return (
    <Link href={href} className={`${card} group p-4 transition hover:border-gold`}>
      <p className="font-display text-4xl text-gold-bright">{value.toLocaleString("en-GB")}</p>
      <p className="mt-1 text-xs tracking-wide text-ink-dim uppercase group-hover:text-ink">{label} →</p>
    </Link>
  );
}

function RailCard({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className={`${card} p-5`}>
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-line pb-2.5">
        <h2 className="font-display text-lg font-semibold tracking-wide text-gold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** The right-hand events feed: date blocks, title, place, a line of description. */
function EventsFeed({ events, total }: { events: Tables<"events">[]; total: number }) {
  return (
    <RailCard
      title="Upcoming events"
      action={
        <Link href="/events" className="text-sm text-gold-bright hover:underline">
          All{total > events.length ? ` ${total}` : ""} →
        </Link>
      }
    >
      {events.length === 0 ? (
        <p className="py-2 text-sm text-ink-dim">
          Nothing on the calendar yet. Rallies, track days and group rides will show up here.
        </p>
      ) : (
        <ol className="divide-y divide-line">
          {events.map((e) => (
              <li key={e.id}>
                <Link href={`/events#event-${e.id}`} className="group flex gap-3 py-3">
                  <EventDate date={e.event_date} />
                  <span className="min-w-0">
                    <span className="font-display block text-base leading-tight text-ink group-hover:text-gold-bright">
                      {e.title}
                    </span>
                    {e.location && (
                      <span className="mt-1 flex items-center gap-1 text-xs text-grey">
                        <PinIcon />
                        {e.location}
                      </span>
                    )}
                    {e.description && (
                      <span className="mt-1 line-clamp-2 block text-xs text-ink-dim">{e.description}</span>
                    )}
                  </span>
                </Link>
              </li>
          ))}
        </ol>
      )}
    </RailCard>
  );
}

function HubCard({
  title,
  href,
  badge,
  cta,
  children,
}: {
  title: string;
  href: string;
  badge?: ReactNode;
  cta: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${card} group flex flex-col p-5 transition hover:border-gold`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="font-display text-xl text-ink group-hover:text-gold-bright">{title}</h3>
        {badge}
      </div>
      <div className="flex-1 text-sm text-ink-dim">{children}</div>
      <span className="font-display mt-4 text-sm tracking-wider text-gold-bright">{cta} →</span>
    </Link>
  );
}
