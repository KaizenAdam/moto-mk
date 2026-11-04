import Link from "next/link";
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { fill, plural } from "@/lib/i18n/format";
import { createClient } from "@/lib/supabase/server";
import { listActiveDealers } from "@/lib/data/dealers";
import { countActiveBySeller } from "@/lib/data/listings";
import { PinIcon, TickIcon } from "@/app/components/icons";
import { BlockHero, Eyebrow, HighlightWord, RedBand, blackButton } from "@/app/components/Bands";
import ShopPhoto from "@/app/components/ShopPhoto";
import EmptyState from "@/app/components/EmptyState";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.meta.dealersTitle,
    description: t.meta.dealersDescription,
  };
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function DealersPage({ searchParams }: { searchParams: SearchParams }) {
  const { town: townParam } = await searchParams;
  const selectedTown = typeof townParam === "string" ? townParam : null;

  const supabase = await createClient();
  const [dealers, { locale, t }] = await Promise.all([listActiveDealers(supabase), getI18n()]);
  const D = t.dealers;
  const stock = await countActiveBySeller(
    supabase,
    dealers.map((d) => d.profile_id),
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
        shard={{
          shape: "bent",
          className:
            "top-[-18%] right-[-90px] h-[136%] w-[360px] -scale-x-100 rotate-[-6deg] bg-highlight/[.13] sm:right-[5%] sm:w-[460px]",
        }}
        title={
          <>
            {D.title1}
            <br />
            <HighlightWord>{D.title2}</HighlightWord>
          </>
        }
        intro={D.intro}
        ticks={
          dealers.length > 0
            ? [plural(locale, dealers.length, D.count), plural(locale, totalBikes, D.inStock), D.shopPhone]
            : undefined
        }
      />

      <div className="mx-auto max-w-[1280px] px-5 pt-10">
        {towns.length > 1 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Link href="/dealers" className={chip(!selectedTown)}>
              {t.common.allTowns}
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
            {selectedTown ? fill(D.noDealersIn, { town: selectedTown }) : D.noDealers}{" "}
            <Link href="/for-business#dealers" className="text-highlight hover:underline">
              {D.apply}
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
                  <div className="relative">
                    <ShopPhoto name={d.business_name} className="aspect-[16/9] w-full" />
                  </div>
                  <div className="flex items-start gap-4 p-5">
                    <span
                      aria-hidden
                      className="font-display relative -mt-12 flex h-14 w-14 shrink-0 items-center justify-center bg-highlight text-3xl text-[#111] outline-4 outline-panel outline-solid"
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
                      <span className="text-sm text-grey">{D.noBikes}</span>
                    ) : (
                      <span className="font-display bg-highlight px-2.5 py-0.5 text-lg text-[#111]">
                        {plural(locale, count, t.common.bikes)}
                      </span>
                    )}
                    <span className="font-display text-sm tracking-[.06em] text-ink group-hover:text-highlight">
                      {D.viewStorefront}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <RedBand
        className="mt-16"
        shard={{
          shape: "double",
          className: "top-[-50px] right-[-160px] h-[520px] w-[560px] -scale-x-100 rotate-[4deg] bg-black/[.16]",
        }}
      >
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <Eyebrow>{D.forBusiness}</Eyebrow>
            <h2 className="font-display text-4xl leading-none sm:text-[44px]">{D.runDealership}</h2>
            <p className="mt-3 max-w-md text-[15px]">{D.runPitch}</p>
            <Link href="/for-business#dealers" className={`${blackButton} mt-6`}>
              {D.applyNow}
            </Link>
          </div>
          <ul className="space-y-3">
            {D.perks.map((p) => (
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
