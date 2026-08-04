import { notFound } from "next/navigation";
import Link from "next/link";
import { dealers, getDealerBySlug } from "@/lib/dealers";
import { getListingsByDealer } from "@/lib/listings";
import ListingCard from "@/components/ListingCard";
import BikeGlyph from "@/components/BikeGlyph";
import ChevronDivider from "@/components/ChevronDivider";

export function generateStaticParams() {
  return dealers.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata(props: PageProps<"/dealers/[slug]">) {
  const { slug } = await props.params;
  const dealer = getDealerBySlug(slug);
  if (!dealer) return { title: "Showroom not found — VoziMoto" };
  return { title: `${dealer.name} — VoziMoto Dealer Showroom` };
}

export default async function DealerPage(props: PageProps<"/dealers/[slug]">) {
  const { slug } = await props.params;
  const dealer = getDealerBySlug(slug);
  if (!dealer) notFound();

  const inventory = getListingsByDealer(dealer.slug);

  return (
    <div>
      <div className="asphalt relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <BikeGlyph className="absolute -left-10 -top-10 w-96 h-auto text-paper" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 md:px-6 py-14 md:py-20">
          <p className="font-data uppercase tracking-widest text-amber text-xs mb-3">
            Authorised Dealer Showroom
          </p>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="font-display uppercase text-4xl md:text-5xl text-paper">
                {dealer.name}
              </h1>
              <p className="text-paper/70 mt-2 max-w-xl text-sm md:text-base">
                {dealer.address} · Est. {dealer.founded}
              </p>
            </div>
            <a
              href={`tel:${dealer.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center rounded-md bg-rally text-paper font-display uppercase tracking-wide px-5 py-3 hover:bg-amber hover:text-tarmac transition-colors"
            >
              Call {dealer.phone}
            </a>
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            {dealer.brands.map((brand) => (
              <span
                key={brand}
                className="rounded-md px-3 py-1 text-xs font-data uppercase tracking-wide text-paper bg-tarmac-raised border border-tarmac-line"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>

      <ChevronDivider />

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <h2 className="font-display uppercase text-2xl mb-3">About the showroom</h2>
          <p className="text-tarmac/90 leading-relaxed mb-8">{dealer.description}</p>

          <h2 className="font-display uppercase text-2xl mb-4">Current inventory</h2>
          {inventory.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {inventory.map((listing) => (
                <ListingCard key={listing.slug} listing={listing} />
              ))}
            </div>
          ) : (
            <p className="text-steel-dark text-sm">No bikes currently listed.</p>
          )}
        </div>

        <aside className="bg-concrete rounded-xl p-6 border border-tarmac-line/10 h-fit">
          <h3 className="font-display uppercase text-sm tracking-widest text-steel-dark mb-3">
            Specialties
          </h3>
          <ul className="space-y-2 text-sm text-tarmac">
            {dealer.specialties.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="text-rally">—</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-6 border-t border-tarmac-line/15">
            <h3 className="font-display uppercase text-sm tracking-widest text-steel-dark mb-2">
              Visit
            </h3>
            <p className="text-sm text-tarmac">{dealer.address}</p>
            <p className="text-sm text-steel-dark mt-1">{dealer.town}, North Macedonia</p>
          </div>
          <Link
            href="/listings"
            className="block mt-6 text-sm text-tarmac underline underline-offset-4 hover:text-rally"
          >
            ← Back to all listings
          </Link>
        </aside>
      </div>
    </div>
  );
}
