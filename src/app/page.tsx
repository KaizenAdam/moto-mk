import Link from "next/link";
import HeroSearch from "@/components/HeroSearch";
import ListingCard from "@/components/ListingCard";
import ChevronDivider from "@/components/ChevronDivider";
import BikeGlyph from "@/components/BikeGlyph";
import { listings, towns, makes } from "@/lib/listings";
import { events } from "@/lib/events";

const featured = listings.filter((l) => l.featured);
const upcomingEvents = [...events]
  .sort((a, b) => a.date.localeCompare(b.date))
  .slice(0, 3);

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Filter by what matters",
    body: "Engine cc, licence category, riding style, and town — not generic classifieds fields built for cars and fridges.",
  },
  {
    step: "02",
    title: "Contact the seller direct",
    body: "Private seller or authorised dealer, every listing shows who you're dealing with before you call.",
  },
  {
    step: "03",
    title: "Meet, inspect, ride",
    body: "We don't hold payments or paperwork — VoziMoto gets you to the right seller, the deal is yours to make.",
  },
];

export default function Home() {
  return (
    <div>
      <section className="asphalt relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <BikeGlyph className="absolute -right-16 -bottom-16 w-[32rem] h-auto text-paper" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <p className="font-data uppercase tracking-[0.2em] text-amber text-xs mb-4">
            North Macedonia · Motorcycles only
          </p>
          <h1 className="font-display uppercase text-4xl md:text-6xl leading-[1.05] text-paper max-w-3xl">
            Buy and sell bikes with people who actually ride
          </h1>
          <p className="mt-5 text-paper/70 max-w-xl text-base md:text-lg">
            Not another mixed classifieds board. VoziMoto is built rider-first —
            filtered by cc, licence category, and riding style, from Skopje
            to Ohrid.
          </p>
          <div className="mt-8 max-w-2xl">
            <HeroSearch />
          </div>
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
            <div>
              <dt className="text-xs font-data uppercase text-steel tracking-widest">Listings</dt>
              <dd className="font-display text-2xl text-paper">{listings.length}+</dd>
            </div>
            <div>
              <dt className="text-xs font-data uppercase text-steel tracking-widest">Makes</dt>
              <dd className="font-display text-2xl text-paper">{makes.length}</dd>
            </div>
            <div>
              <dt className="text-xs font-data uppercase text-steel tracking-widest">Towns covered</dt>
              <dd className="font-display text-2xl text-paper">{towns.length}</dd>
            </div>
          </dl>
        </div>
      </section>

      <ChevronDivider />

      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-14 md:py-20">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="font-data uppercase tracking-widest text-rally text-xs mb-1">
                Featured
              </p>
              <h2 className="font-display uppercase text-2xl md:text-3xl">
                Handpicked bikes this week
              </h2>
            </div>
            <Link
              href="/listings"
              className="hidden sm:inline text-sm font-body text-tarmac hover:text-rally underline underline-offset-4"
            >
              View all listings →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((listing) => (
              <ListingCard key={listing.slug} listing={listing} />
            ))}
          </div>
          <Link
            href="/listings"
            className="sm:hidden mt-6 inline-block text-sm font-body text-tarmac underline underline-offset-4"
          >
            View all listings →
          </Link>
        </div>
      </section>

      <section className="bg-concrete">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-14 md:py-20">
          <p className="font-data uppercase tracking-widest text-pine text-xs mb-1">
            How it works
          </p>
          <h2 className="font-display uppercase text-2xl md:text-3xl mb-8">
            Three steps, no middlemen
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.step}
                className="bg-paper rounded-xl p-6 border border-tarmac-line/10"
              >
                <span className="font-display text-4xl text-steel/50">
                  {item.step}
                </span>
                <h3 className="font-display uppercase text-lg mt-3 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-steel-dark leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ChevronDivider subtle />

      <section className="asphalt">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-14 md:py-20">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="font-data uppercase tracking-widest text-amber text-xs mb-1">
                Moto Sobiri
              </p>
              <h2 className="font-display uppercase text-2xl md:text-3xl text-paper">
                Rallies & group rides near you
              </h2>
            </div>
            <Link
              href="/events"
              className="hidden sm:inline text-sm font-body text-paper/80 hover:text-amber underline underline-offset-4"
            >
              See the full calendar →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {upcomingEvents.map((event) => (
              <Link
                key={event.slug}
                href="/events"
                className="block bg-tarmac-raised rounded-xl p-5 border border-tarmac-line hover:border-amber transition-colors"
              >
                <p className="font-data text-amber text-xs uppercase tracking-widest mb-2">
                  {new Date(event.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <h3 className="font-display uppercase text-lg text-paper mb-1">
                  {event.title}
                </h3>
                <p className="text-sm text-steel">{event.location} · {event.region}</p>
                <p className="text-sm text-paper/60 mt-3 line-clamp-2">
                  {event.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-14 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-tarmac-line/10 p-8 bg-concrete">
            <h3 className="font-display uppercase text-xl mb-2">Selling? It&apos;s free to list.</h3>
            <p className="text-sm text-steel-dark mb-5">
              Post your bike with real spec fields — cc, licence category, riding
              style — so serious buyers find you faster.
            </p>
            <Link
              href="/sell"
              className="inline-flex items-center rounded-md bg-rally text-paper font-display uppercase tracking-wide px-4 py-2.5 hover:bg-amber hover:text-tarmac transition-colors"
            >
              List your bike
            </Link>
          </div>
          <div className="rounded-2xl border border-tarmac-line/10 p-8 asphalt">
            <h3 className="font-display uppercase text-xl mb-2 text-paper">Run a showroom?</h3>
            <p className="text-sm text-paper/70 mb-5">
              See how a premium branded dealer storefront looks on VoziMoto —
              full inventory, workshop specialties, and direct contact.
            </p>
            <Link
              href="/dealers/mototech-skopje"
              className="inline-flex items-center rounded-md border border-amber text-amber font-display uppercase tracking-wide px-4 py-2.5 hover:bg-amber hover:text-tarmac transition-colors"
            >
              View example showroom
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
