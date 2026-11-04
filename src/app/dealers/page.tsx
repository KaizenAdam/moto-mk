import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listActiveDealers } from "@/lib/data/dealers";
import { countActiveBySeller } from "@/lib/data/listings";
import { PinIcon, TickIcon } from "@/app/components/icons";
import { BlockHero, Eyebrow, HighlightWord, RedBand, blackButton } from "@/app/components/Bands";
import EmptyState from "@/app/components/EmptyState";

export const metadata: Metadata = {
  title: "Motorcycle dealers in North Macedonia",
  description: "Browse North Macedonia's motorcycle dealerships and their bikes for sale.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const DEALER_PERKS = [
  "Your own storefront with every bike you have",
  "A Verified dealer badge on each listing",
  "Your shop line on every bike, with WhatsApp and Call",
];

export default async function DealersPage({ searchParams }: { searchParams: SearchParams }) {
  const { town: townParam } = await searchParams;
  const selectedTown = typeof townParam === "string" ? townParam : null;

  const supabase = await createClient();
  const dealers = await listActiveDealers(supabase);
  const stock = await countActiveBySeller(
    supabase,
    dealers.map((d) => d.profile_id)
  );
  const towns = [...new Set(dealers.map((d) => d.town).filter((t): t is string => !!t))].sort();
  // Dealers with bikes first, then alphabetical (the query's order).
  const sorted = dealers
    .filter((d) => !selectedTown || d.town === selectedTown)
    .sort((a, b) => (stock.get(b.profile_id) ?? 0) - (stock.get(a.profile_id) ?? 0));
  const totalBikes = dealers.reduce((n, d) => n + (stock.get(d.profile_id) ?? 0), 0);

  const chip = (active: boolean) =>
    `font-display border px-3.5 py-2 text-sm tracking-[.04em] transition ${
      active ? "border-highlight bg-highlight text-[#111]" : "border-line bg-panel text-ink hover:border-highlight"
    }`;

  return (
    <main className="pb-16">
      <BlockHero
        title={
          <>
            Buy from a
            <br />
            <HighlightWord>verified dealer</HighlightWord>
          </>
        }
        intro="Motorcycle dealerships across North Macedonia, every one checked by us before it appears here."
        ticks={
          dealers.length > 0
            ? [
                `${dealers.length} dealer${dealers.length === 1 ? "" : "s"}`,
                `${totalBikes} bike${totalBikes === 1 ? "" : "s"} in stock`,
                "Shop phone on every listing",
              ]
            : undefined
        }
      />

      <div className="mx-auto max-w-[1280px] px-5 pt-10">
        {towns.length > 1 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Link href="/dealers" className={chip(!selectedTown)}>
              All towns
            </Link>
            {towns.map((t) => (
              <Link key={t} href={`/dealers?town=${encodeURIComponent(t)}`} className={chip(selectedTown === t)}>
                {t}
              </Link>
            ))}
          </div>
        )}

        {sorted.length === 0 ? (
          <EmptyState>
            No dealers {selectedTown ? `in ${selectedTown}` : ""} yet.{" "}
            <Link href="/for-business#dealers" className="text-highlight hover:underline">
              Run a dealership? Apply here.
            </Link>
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((d) => {
              const count = stock.get(d.profile_id) ?? 0;
              return (
                <Link
                  key={d.profile_id}
                  href={`/dealers/${d.slug}`}
                  className="group flex flex-col border border-line bg-panel transition hover:border-highlight"
                >
                  <div className="flex items-start gap-4 p-5">
                    <span
                      aria-hidden
                      className="font-display flex h-14 w-14 shrink-0 items-center justify-center bg-highlight text-3xl text-[#111]"
                    >
                      {d.business_name.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-display text-[22px] leading-tight text-ink group-hover:text-highlight">
                        {d.business_name}
                      </h2>
                      {d.town && (
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-grey">
                          <PinIcon />
                          {d.town}
                        </p>
                      )}
                    </div>
                  </div>
                  {d.about && <p className="line-clamp-2 px-5 text-sm text-ink-dim">{d.about}</p>}
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-line px-5 py-4 pt-4">
                    {count === 0 ? (
                      <span className="text-sm text-grey">No bikes listed right now</span>
                    ) : (
                      <span className="font-display bg-highlight px-2.5 py-0.5 text-lg text-[#111]">
                        {count} bike{count > 1 ? "s" : ""}
                      </span>
                    )}
                    <span className="font-display text-sm tracking-[.06em] text-ink group-hover:text-highlight">
                      View storefront &gt;&gt;&gt;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <RedBand className="mt-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <Eyebrow>For business</Eyebrow>
            <h2 className="font-display text-4xl leading-none sm:text-[44px]">Run a dealership?</h2>
            <p className="mt-3 max-w-md text-[15px]">
              Put your stock in front of riders all over North Macedonia. Listing bikes is free.
            </p>
            <Link href="/for-business#dealers" className={`${blackButton} mt-6`}>
              Apply now &gt;&gt;&gt;
            </Link>
          </div>
          <ul className="space-y-3">
            {DEALER_PERKS.map((p) => (
              <li key={p} className="flex items-center gap-4 bg-[#0a0a0a] px-5 py-4">
                <TickIcon className="h-5 w-5 shrink-0 text-highlight" />
                <span className="font-display text-lg font-normal">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </RedBand>
    </main>
  );
}
