import Link from "next/link";
import type { ReactNode } from "react";
import { BlockHero, HighlightWord, type ShardSpec } from "./Bands";
import Badge from "./Badge";
import { getI18n } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/format";
import { CONTACT_EMAIL } from "@/lib/site";

/**
 * The layout for /privacy and /terms: a compact hero, a draft notice, then
 * numbered sections. The text lives in the dictionaries (`legal.privacy`,
 * `legal.terms`) and is a TEMPLATE written from what the site really does
 * (Nov 2026). Square-bracketed parts are details the client hasn't given
 * yet. A lawyer should review all three languages before launch, and the
 * draft notice comes off then (`draft={false}`).
 */
export default async function LegalPage({
  doc,
  shard,
  draft = true,
}: {
  doc: "privacy" | "terms";
  shard: ShardSpec;
  draft?: boolean;
}) {
  const { t } = await getI18n();
  const L = t.legal;
  const page = L[doc];

  return (
    <main className="pb-16">
      <BlockHero
        compact
        shard={shard}
        above={draft ? <Badge tone="red">{L.draftBadge}</Badge> : undefined}
        title={
          <>
            {page.first} <HighlightWord>{page.highlight}</HighlightWord>
          </>
        }
        intro={page.intro}
      />

      <div className="mx-auto max-w-3xl px-5 pt-10">
        <p className="text-sm text-grey">{fill(L.lastUpdated, { date: L.updated })}</p>
        {draft && (
          <p className="mt-3 border-l-4 border-highlight bg-panel px-4 py-3 text-sm text-ink-dim">{L.draftNote}</p>
        )}

        <ol className="mt-8 space-y-9">
          {page.sections.map((s, i) => (
            <li key={s.heading}>
              <h2 className="font-display mb-3 flex items-baseline gap-3 text-2xl">
                <span className="text-highlight">{i + 1}.</span>
                {s.heading}
              </h2>
              <div className="space-y-3 text-[15px] leading-relaxed text-ink-dim">
                {s.blocks.map((block, j) =>
                  Array.isArray(block) ? (
                    <ul key={j} className="space-y-1.5">
                      {block.map((item) => (
                        <li key={item} className="ml-5 list-disc">
                          {rich(item)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p key={j}>{rich(block)}</p>
                  ),
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}

/** The dictionary's tiny inline markup: **bold**, [text](/path) and {email}. */
function rich(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|\{email\})/).map((part, i) => {
    if (part.startsWith("**")) {
      return (
        <strong key={i} className="text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <Link key={i} href={link[2]} className="text-highlight hover:underline">
          {link[1]}
        </Link>
      );
    }
    if (part === "{email}") {
      return (
        <a key={i} href={`mailto:${CONTACT_EMAIL}`} className="text-highlight hover:underline">
          {CONTACT_EMAIL}
        </a>
      );
    }
    return part;
  });
}
