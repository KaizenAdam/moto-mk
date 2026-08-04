import { notFound } from "next/navigation";
import Link from "next/link";
import { listings, getListingBySlug } from "@/lib/listings";
import { getDealerBySlug } from "@/lib/dealers";
import ListingPhoto from "@/components/ListingPhoto";
import PricePlate from "@/components/PricePlate";
import ListingCard from "@/components/ListingCard";
import ChevronDivider from "@/components/ChevronDivider";
import { LICENSE_LABELS, formatCc, formatMileage, timeAgo } from "@/lib/format";

export function generateStaticParams() {
  return listings.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata(props: PageProps<"/listings/[slug]">) {
  const { slug } = await props.params;
  const listing = getListingBySlug(slug);
  if (!listing) return { title: "Listing not found — VoziMoto" };
  return {
    title: `${listing.make} ${listing.model} (${listing.year}) — VoziMoto`,
  };
}

export default async function ListingDetailPage(props: PageProps<"/listings/[slug]">) {
  const { slug } = await props.params;
  const listing = getListingBySlug(slug);
  if (!listing) notFound();

  const dealer = listing.dealerSlug ? getDealerBySlug(listing.dealerSlug) : undefined;
  const related = listings
    .filter((l) => l.slug !== listing.slug && l.ridingStyle === listing.ridingStyle)
    .slice(0, 3);

  const specs: [string, string][] = [
    ["Make", listing.make],
    ["Model", listing.model],
    ["Year", String(listing.year)],
    ["Engine", formatCc(listing.cc)],
    ["Engine type", listing.engineType],
    ["Licence category", LICENSE_LABELS[listing.licenseCategory]],
    ["Riding style", listing.ridingStyle],
    ["Mileage", formatMileage(listing.mileageKm)],
    ["Condition", listing.condition],
    ["Colour", listing.colour],
    ["Location", listing.town],
  ];

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 text-sm">
        <nav aria-label="Breadcrumb" className="text-steel-dark">
          <Link href="/listings" className="hover:text-rally">Browse</Link>
          <span className="mx-1.5">/</span>
          <span className="text-tarmac">{listing.make} {listing.model}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6 pb-16 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-10">
        <div>
          <div className="rounded-xl overflow-hidden border border-tarmac-line/10">
            <ListingPhoto ridingStyle={listing.ridingStyle} make={listing.make} model={listing.model} />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg overflow-hidden border border-tarmac-line/10 opacity-80">
                <ListingPhoto ridingStyle={listing.ridingStyle} make={listing.make} model={listing.model} compact />
              </div>
            ))}
          </div>
          <p className="text-xs text-steel-dark mt-2 font-body">
            Studio photography for this listing is pending — spec-accurate placeholder shown.
          </p>

          <div className="mt-10">
            <h2 className="font-display uppercase text-xl mb-3">Description</h2>
            <p className="text-tarmac/90 leading-relaxed">{listing.description}</p>
          </div>

          <div className="mt-10">
            <h2 className="font-display uppercase text-xl mb-4">Specification</h2>
            <dl className="font-data text-sm border border-tarmac-line/15 rounded-xl overflow-hidden">
              {specs.map(([label, value], i) => (
                <div
                  key={label}
                  className={`flex justify-between px-4 py-2.5 ${i % 2 === 0 ? "bg-concrete" : "bg-paper"}`}
                >
                  <dt className="text-steel-dark uppercase tracking-wide text-xs pt-0.5">{label}</dt>
                  <dd className="text-tarmac font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div>
          <div className="sticky top-20 rounded-xl border border-tarmac-line/15 p-6 bg-concrete">
            <h1 className="font-display uppercase text-2xl leading-tight mb-1">
              {listing.make} {listing.model}
            </h1>
            <p className="text-sm text-steel-dark mb-4">
              {listing.year} · {listing.town} · {timeAgo(listing.postedDaysAgo)}
            </p>
            <PricePlate priceEur={listing.priceEur} size="lg" />

            <div className="mt-6 pt-6 border-t border-tarmac-line/15">
              <p className="text-xs font-data uppercase tracking-widest text-steel-dark mb-2">
                {listing.sellerType === "Dealer" ? "Sold by dealer" : "Private seller"}
              </p>
              <p className="font-display uppercase text-lg mb-3">{listing.sellerName}</p>
              <a
                href={`tel:${listing.phone.replace(/\s/g, "")}`}
                className="block w-full text-center rounded-md bg-rally text-paper font-display uppercase tracking-wide px-4 py-3 hover:bg-amber hover:text-tarmac transition-colors mb-2"
              >
                Call {listing.phone}
              </a>
              <button
                type="button"
                className="block w-full text-center rounded-md border border-tarmac text-tarmac font-display uppercase tracking-wide px-4 py-3 hover:border-amber hover:text-amber transition-colors"
              >
                Message seller
              </button>
              {dealer && (
                <Link
                  href={`/dealers/${dealer.slug}`}
                  className="block mt-4 text-sm text-tarmac underline underline-offset-4 hover:text-rally"
                >
                  View {dealer.name}&rsquo;s full showroom →
                </Link>
              )}
            </div>

            <p className="text-xs text-steel-dark mt-6">
              Always view the bike in person and verify ownership documents
              before paying a deposit.
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <>
          <ChevronDivider subtle />
          <section className="bg-concrete">
            <div className="mx-auto max-w-7xl px-4 md:px-6 py-14">
              <h2 className="font-display uppercase text-2xl mb-6">
                More {listing.ridingStyle.toLowerCase()} bikes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {related.map((l) => (
                  <ListingCard key={l.slug} listing={l} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
