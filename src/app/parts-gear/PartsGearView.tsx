"use client";

import { useState } from "react";
import Link from "next/link";
import { PART_CATEGORIES } from "@/lib/constants/parts";
import { useI18n } from "@/app/components/I18nProvider";
import { fill } from "@/lib/i18n/format";
import { BlockHero, Eyebrow, GoldBanner, HighlightWord, RedBand, blackButton } from "@/app/components/Bands";
import EmptyState from "@/app/components/EmptyState";
import Badge from "@/app/components/Badge";

/**
 * The Parts & Gear page. Picking a subcategory narrows the page to it —
 * which, until the parts backend exists, is an empty state, never sample
 * items.
 */
export default function PartsGearView() {
  const [selected, setSelected] = useState<string | null>(null);
  const { t } = useI18n();
  const P = t.parts;
  const selectedName = selected ? (P.subs[selected]?.lower ?? selected) : "";

  return (
    <main className="pb-16">
      <BlockHero
        shard={{
          shape: "fang",
          className: "top-0 right-[-80px] h-[140%] w-[340px] bg-red/[.24] sm:right-[3%] sm:w-[480px]",
        }}
        title={
          <>
            {P.title1} <HighlightWord>{P.title2}</HighlightWord>
          </>
        }
        intro={P.intro}
      >
        <div className="max-w-[640px]">
          <div className="flex bg-white opacity-90">
            <label htmlFor="parts-search" className="sr-only">
              {P.searchLabel}
            </label>
            <input
              id="parts-search"
              type="text"
              disabled
              placeholder={P.searchPlaceholder}
              className="min-w-0 flex-1 cursor-not-allowed border-0 bg-transparent px-4 py-4 text-base text-[#111] outline-none placeholder:text-[#77767c] sm:px-5"
            />
            <button
              type="button"
              disabled
              className="font-display cursor-not-allowed bg-highlight px-4 text-base font-semibold tracking-[.08em] text-[#111] sm:px-6"
            >
              {t.common.search}
            </button>
          </div>
          <p className="mt-3 flex items-center gap-2 text-sm text-[#d6d3cb]">
            <Badge tone="red">{t.common.comingSoon}</Badge>
            {P.openingSoon}
          </p>
        </div>
      </BlockHero>

      <div className="mx-auto max-w-[1280px] space-y-14 px-5 pt-12">
        {PART_CATEGORIES.map((cat) => (
          <section key={cat.id}>
            <h2 className="font-display text-[28px] font-semibold sm:text-[32px]">
              {P.categories[cat.id]?.name ?? cat.name}
            </h2>
            <p className="mt-1 mb-5 text-sm text-ink-dim">{P.categories[cat.id]?.summary ?? cat.summary}</p>
            <div className="grid grid-cols-3 gap-1.5 lg:grid-cols-6">
              {cat.subcategories.map((sub) => {
                const active = sub.id === selected;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelected(active ? null : sub.id)}
                    aria-pressed={active}
                    className="group relative block aspect-[4/5] overflow-hidden bg-panel2 text-left [clip-path:polygon(18%_0,100%_0,82%_100%,0_100%)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- small static, pre-sized tile photo */}
                    <img
                      src={`/parts/${sub.id}.jpg`}
                      width={480}
                      height={600}
                      alt=""
                      loading="lazy"
                      className={`h-full w-full object-cover grayscale transition duration-300 group-hover:scale-105 ${
                        active ? "brightness-90" : "brightness-[.55] group-hover:brightness-75"
                      }`}
                    />
                    <span
                      className={`font-display absolute bottom-3 left-[8%] px-1.5 py-0.5 text-[11px] sm:bottom-4 sm:left-[22%] sm:px-2.5 sm:text-[17px] ${
                        active ? "bg-red text-white" : "bg-highlight text-[#111]"
                      }`}
                    >
                      {P.subs[sub.id]?.name ?? sub.name}
                    </span>
                  </button>
                );
              })}
            </div>
            {cat.subcategories.some((s) => s.id === selected) && (
              <div className="mt-4">
                <EmptyState>
                  {fill(P.noneYet, { name: selectedName })}{" "}
                  <button type="button" onClick={() => setSelected(null)} className="text-highlight hover:underline">
                    {t.common.showAll}
                  </button>
                </EmptyState>
              </div>
            )}
          </section>
        ))}
      </div>

      <RedBand
        className="mt-16"
        shard={{
          shape: "double",
          className: "top-[10%] right-[-120px] h-[110%] w-[420px] rotate-[-8deg] bg-black/[.16] sm:right-[-20px]",
        }}
      >
        <Eyebrow>{t.common.comingSoon}</Eyebrow>
        <h2 className="font-display mb-6 text-4xl leading-none sm:text-[44px]">{P.howItWorks}</h2>
        <ol className="grid gap-3 md:grid-cols-3">
          {P.steps.map(({ title, body }, i) => (
            <li key={title} className="bg-[#0a0a0a] px-5 py-5">
              <span className="font-display text-4xl leading-none text-highlight">{i + 1}</span>
              <p className="font-display mt-2 text-[22px] font-normal">{title}</p>
              <p className="mt-1 text-sm text-[#bdbab2]">{body}</p>
            </li>
          ))}
        </ol>
        <Link
          href="/bikes"
          className="font-display mt-6 inline-block border-b-2 border-white font-normal tracking-[.06em]"
        >
          {P.browseMeanwhile}
        </Link>
      </RedBand>

      <div className="mt-16">
        <GoldBanner
          title={P.clearingOut}
          shard={{ shape: "claw", className: "inset-y-0 right-[-4%] hidden w-[40%] bg-[#111] opacity-90 md:block" }}
          body={P.clearingBody}
          action={
            <Link href="/sell" className={blackButton}>
              {P.listBikeFree}
            </Link>
          }
        />
      </div>
    </main>
  );
}
