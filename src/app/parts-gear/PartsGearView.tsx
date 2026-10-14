"use client";

import { useState } from "react";
import Link from "next/link";
import { PART_CATEGORIES } from "@/lib/constants/parts";
import PageHero from "@/app/components/PageHero";
import SectionHeading from "@/app/components/SectionHeading";
import EmptyState from "@/app/components/EmptyState";
import Badge from "@/app/components/Badge";
import { HelmetIcon, WrenchIcon } from "@/app/components/icons";
import { button, card, input } from "@/app/components/ui";

/**
 * The Parts & Gear page. Picking a subcategory narrows the page to it —
 * which, until the parts backend exists, is an empty state, never sample
 * items.
 */
export default function PartsGearView() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedName = PART_CATEGORIES.flatMap((c) => c.subcategories).find((s) => s.id === selected)?.name;

  return (
    <main className="pb-16">
      <PageHero
        title="Parts & Gear"
        intro="Everything else motorcycle: spare parts, accessories and riding gear from riders and shops across North Macedonia."
      >
        <div className="flex max-w-3xl gap-2.5 rounded-lg border border-line bg-panel p-2">
          <input
            type="text"
            disabled
            placeholder="Search by brand, e.g. Alpinestars, Akrapovič… (opens soon)"
            className={`${input} mt-0 border-0 bg-transparent disabled:cursor-not-allowed`}
          />
          <button type="button" disabled className={button("primary")}>
            Search
          </button>
        </div>
      </PageHero>

      <div className="mx-auto max-w-[1280px] space-y-12 px-4 pt-8 sm:px-5">
        <div className="flex flex-col gap-3 rounded-[10px] border border-gold/40 bg-gold/10 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink">
            <Badge tone="red" className="mr-2">
              Coming soon
            </Badge>
            Buying and selling parts &amp; gear opens shortly. Here&rsquo;s what&rsquo;ll be on offer.
          </p>
          <Link href="/bikes" className="shrink-0 text-gold-bright hover:underline">
            Browse bikes meanwhile →
          </Link>
        </div>

        {PART_CATEGORIES.map((cat) => (
          <section key={cat.id}>
            <SectionHeading>{cat.name}</SectionHeading>
            <p className="-mt-2 mb-4 text-sm text-ink-dim">{cat.summary}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {cat.subcategories.map((sub) => {
                const active = sub.id === selected;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelected(active ? null : sub.id)}
                    aria-pressed={active}
                    className={`${card} group flex flex-col items-start gap-3 p-4 text-left transition ${
                      active ? "border-gold shadow-[0_0_0_1px_var(--gold)]" : "hover:border-gold"
                    }`}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-panel2 text-gold">
                      {cat.id === "gear" ? <HelmetIcon /> : <WrenchIcon />}
                    </span>
                    <span>
                      <span className="font-display block text-lg text-ink group-hover:text-gold-bright">{sub.name}</span>
                      <span className="text-xs text-grey">No listings yet</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {cat.subcategories.some((s) => s.id === selected) && (
              <div className="mt-4">
                <EmptyState>
                  No {selectedName?.toLowerCase()} listed yet — selling opens soon.{" "}
                  <button type="button" onClick={() => setSelected(null)} className="text-gold-bright hover:underline">
                    Show all
                  </button>
                </EmptyState>
              </div>
            )}
          </section>
        ))}

        <section>
          <SectionHeading>How it&rsquo;ll work</SectionHeading>
          <ol className="grid gap-4 sm:grid-cols-3">
            {[
              ["One profile", "List parts and gear under the same profile as your bike — buyers see everything you're selling."],
              ["Search by brand", "Find the exact helmet, exhaust or tyre by brand, size and condition."],
              ["Contact like bikes", "Call or WhatsApp the seller straight from the listing, same as buying a bike."],
            ].map(([title, body], i) => (
              <li key={title} className={`${card} p-5`}>
                <span className="font-display text-3xl text-gold">{i + 1}</span>
                <p className="font-display mt-1 text-lg">{title}</p>
                <p className="mt-1 text-sm text-ink-dim">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col items-start gap-4 rounded-[10px] border border-gold/40 bg-gradient-to-br from-gold/15 to-red/10 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="font-display text-3xl">Clearing out the garage?</h2>
            <p className="mt-1 text-sm text-ink-dim">
              Selling parts and gear opens soon. You can already list a whole bike for free.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button type="button" disabled className={button("outline", "lg")}>
              Sell parts &amp; gear
            </button>
            <Link href="/sell" className={button("primary", "lg")}>
              + List a bike
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
