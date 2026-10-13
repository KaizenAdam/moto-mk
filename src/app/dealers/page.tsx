import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listActiveDealers } from "@/lib/data/dealers";
import { countActiveBySeller } from "@/lib/data/listings";
import { PinIcon } from "@/app/components/icons";
import PageHero from "@/app/components/PageHero";
import Badge from "@/app/components/Badge";
import EmptyState from "@/app/components/EmptyState";

export const metadata: Metadata = {
  title: "Motorcycle dealers in North Macedonia",
  description: "Browse North Macedonia's motorcycle dealerships and their bikes for sale.",
};

export default async function DealersPage() {
  const supabase = await createClient();
  const dealers = await listActiveDealers(supabase);
  const stock = await countActiveBySeller(
    supabase,
    dealers.map((d) => d.profile_id)
  );
  // Dealers with bikes first, then alphabetical (the query's order).
  const sorted = [...dealers].sort(
    (a, b) => (stock.get(b.profile_id) ?? 0) - (stock.get(a.profile_id) ?? 0)
  );

  return (
    <main>
      <PageHero
        title="Dealers"
        intro="Motorcycle dealerships across North Macedonia — every one checked by us before it appears here."
      />

      <div className="mx-auto max-w-[1280px] px-6 py-8 pb-14">
        {sorted.length === 0 ? (
          <EmptyState>
            No dealers yet.{" "}
            <Link href="/garage" className="text-gold-bright hover:underline">
              Run a dealership? Apply from My Garage.
            </Link>
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((d) => {
              const count = stock.get(d.profile_id) ?? 0;
              return (
                <Link
                  key={d.profile_id}
                  href={`/dealers/${d.slug}`}
                  className="group rounded-[10px] border border-line bg-panel p-5 transition hover:-translate-y-0.5 hover:border-gold"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h2 className="font-display text-xl text-ink group-hover:text-gold-bright">
                      {d.business_name}
                    </h2>
                    <Badge>Dealer</Badge>
                  </div>
                  {d.town && (
                    <div className="mb-2 flex items-center gap-1.5 text-sm text-grey">
                      <PinIcon />
                      {d.town}
                    </div>
                  )}
                  {d.about && <p className="mb-3 line-clamp-2 text-sm text-ink-dim">{d.about}</p>}
                  <p className="text-sm font-bold text-gold-bright">
                    {count === 0 ? "No bikes listed right now" : `${count} bike${count > 1 ? "s" : ""} for sale →`}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
