import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listActiveDealers } from "@/lib/data/dealers";
import { countActiveBySeller } from "@/lib/data/listings";
import { PinIcon } from "@/app/components/icons";
import { heroBackground } from "@/app/components/ui";

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
      <section
        className="border-b border-line px-5 py-8"
        style={{
          background: heroBackground,
        }}
      >
        <div className="mx-auto max-w-[1280px]">
          <h1 className="font-display mb-1.5 text-2xl">Dealers</h1>
          <p className="text-sm text-ink-dim">
            Motorcycle dealerships across North Macedonia — every one checked by us before it
            appears here.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-6 py-8 pb-14">
        {sorted.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-line px-5 py-10 text-center text-sm text-ink-dim">
            No dealers yet.{" "}
            <Link href="/garage" className="text-gold-bright hover:underline">
              Run a dealership? Apply from My Garage.
            </Link>
          </div>
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
                    <h2 className="font-display text-lg text-ink group-hover:text-gold-bright">
                      {d.business_name}
                    </h2>
                    <span className="shrink-0 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-[#141414] uppercase">
                      Dealer
                    </span>
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
