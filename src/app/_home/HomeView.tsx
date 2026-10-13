import Link from "next/link";
import type { Tables } from "@/lib/database.types";
import PageHero from "@/app/components/PageHero";
import SectionHeading from "@/app/components/SectionHeading";
import ListingCard, { type ListingCardData } from "@/app/components/ListingCard";
import AdSlot from "@/app/components/AdSlot";
import Badge from "@/app/components/Badge";
import { PinIcon } from "@/app/components/icons";
import { button, card } from "@/app/components/ui";

export type StyleTile = { style: string; count: number; coverUrl: string | null };
export type DealerTile = { slug: string; business_name: string; town: string | null; stock: number };

/**
 * The home page: a hub for the whole riding scene, not just a search box.
 * Bikes first (search, browse by type, latest), then the rest of the
 * client's site map — parts & gear, events, service centres, forum,
 * dealers — and an ad slot. Markup only; page.tsx fetches.
 */
export default function HomeView({
  styles,
  latest,
  latestAreFeatured,
  events,
  serviceCentres,
  dealers,
  isLoggedIn,
}: {
  styles: StyleTile[];
  latest: ListingCardData[];
  /** True once paid featured listings exist; until then the row is "Latest bikes". */
  latestAreFeatured: boolean;
  events: Tables<"events">[];
  serviceCentres: { count: number; towns: string[] };
  dealers: DealerTile[];
  isLoggedIn: boolean;
}) {
  return (
    <main className="pb-16">
      <PageHero
        size="lg"
        title={
          <>
            Find your next ride in <em className="not-italic text-gold">North Macedonia</em>
          </>
        }
        intro="Bikes for sale from riders and trusted dealers, plus the workshops, events and people that keep North Macedonia riding."
      >
        <form action="/bikes" method="GET" className="flex gap-2.5 rounded-lg border border-line bg-panel p-2">
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
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link href="/bikes" className={button("outline", "sm")}>
            Browse all bikes
          </Link>
          <Link href="/sell" className={button("outline", "sm")}>
            Sell your bike free
          </Link>
        </div>
      </PageHero>

      <div className="mx-auto max-w-[1280px] space-y-14 px-4 pt-10 sm:px-5">
        <section>
          <SectionHeading>Browse by type</SectionHeading>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {styles.map((t) => (
              <Link
                key={t.style}
                href={`/bikes?style=${encodeURIComponent(t.style)}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-[10px] border border-line bg-panel2 transition hover:border-gold"
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
            {/* Phones: a sideways-scrolling row rather than eight cards stacked. */}
            <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 xl:grid-cols-4">
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <HubCard
              title="Parts & Gear"
              href="/parts-gear"
              badge={<Badge tone="red">Coming soon</Badge>}
              cta="Take a look"
            >
              <ul className="space-y-1">
                <li>Spare parts &amp; accessories</li>
                <li>Gear — helmets, jackets, boots</li>
              </ul>
              <p className="mt-2 text-grey">Search by brand, from riders and shops.</p>
            </HubCard>

            <HubCard title="Events" href="/events" cta="All events">
              {events.length === 0 ? (
                <p>Rallies, track days and group rides — the calendar fills up soon.</p>
              ) : (
                <ul className="space-y-2.5">
                  {events.map((e) => (
                    <li key={e.id}>
                      <p className="text-ink">{e.title}</p>
                      <p className="text-xs text-grey">
                        {[formatEventDate(e.event_date), e.location].filter(Boolean).join(" · ")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
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

            <HubCard
              title="Rider Forum"
              href="/events"
              badge={<Badge tone="red">Coming soon</Badge>}
              cta="Meanwhile, ride with us"
            >
              <p>Ask questions, swap stories and plan rides with riders across North Macedonia.</p>
            </HubCard>
          </div>
        </section>

        {dealers.length > 0 && (
          <section>
            <SectionHeading
              action={
                <Link href="/dealers" className="text-sm text-gold-bright hover:underline">
                  All dealers →
                </Link>
              }
            >
              Dealers
            </SectionHeading>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {dealers.slice(0, 4).map((d) => (
                <Link
                  key={d.slug}
                  href={`/dealers/${d.slug}`}
                  className={`${card} group flex items-center gap-3 p-4 transition hover:border-gold`}
                >
                  <span className="font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-panel2 text-xl text-gold">
                    {d.business_name.charAt(0)}
                  </span>
                  <span className="min-w-0">
                    <span className="font-display block truncate text-lg text-ink group-hover:text-gold-bright">
                      {d.business_name}
                    </span>
                    <span className="block text-xs text-grey">
                      {[d.town, d.stock > 0 ? `${d.stock} bike${d.stock === 1 ? "" : "s"}` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col items-start gap-4 rounded-[10px] border border-gold/40 bg-gradient-to-br from-gold/15 to-red/10 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="font-display text-3xl">Got a bike to sell?</h2>
            <p className="mt-1 text-sm text-ink-dim">
              List it free in a few minutes. Every listing is checked before it goes live.
            </p>
          </div>
          <Link href="/sell" className={button("primary", "lg")}>
            + List your bike free
          </Link>
        </section>
      </div>
    </main>
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
  badge?: React.ReactNode;
  cta: string;
  children: React.ReactNode;
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

function formatEventDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
