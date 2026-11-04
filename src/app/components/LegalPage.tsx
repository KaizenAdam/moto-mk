import type { ReactNode } from "react";
import { BlockHero, HighlightWord, type ShardSpec } from "./Bands";
import Badge from "./Badge";

/**
 * The layout for /privacy and /terms: a compact hero, a draft notice, then
 * numbered sections. The text is a TEMPLATE written from what the site
 * really does (Nov 2026). Square-bracketed parts are details the client
 * hasn't given yet. A lawyer should review both before launch, and the
 * draft notice comes off then (`draft={false}`).
 */
export type LegalSection = { heading: string; body: ReactNode };

export default function LegalPage({
  first,
  highlight,
  intro,
  updated,
  shard,
  sections,
  draft = true,
}: {
  first: string;
  highlight: string;
  intro: string;
  updated: string;
  shard: ShardSpec;
  sections: LegalSection[];
  draft?: boolean;
}) {
  return (
    <main className="pb-16">
      <BlockHero
        compact
        shard={shard}
        above={draft ? <Badge tone="red">Draft</Badge> : undefined}
        title={
          <>
            {first} <HighlightWord>{highlight}</HighlightWord>
          </>
        }
        intro={intro}
      />

      <div className="mx-auto max-w-3xl px-5 pt-10">
        <p className="text-sm text-grey">Last updated {updated}</p>
        {draft && (
          <p className="mt-3 border-l-4 border-highlight bg-panel px-4 py-3 text-sm text-ink-dim">
            This is a draft that will be finalised before Just5Up! launches. Parts in [square brackets] are still to be
            confirmed.
          </p>
        )}

        <ol className="mt-8 space-y-9">
          {sections.map((s, i) => (
            <li key={s.heading}>
              <h2 className="font-display mb-3 flex items-baseline gap-3 text-2xl">
                <span className="text-highlight">{i + 1}.</span>
                {s.heading}
              </h2>
              <div className="space-y-3 text-[15px] leading-relaxed text-ink-dim [&_a]:text-highlight [&_a:hover]:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink [&_ul]:space-y-1.5">
                {s.body}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
