import type { ReactNode } from "react";
import Shard, { type ShardShape } from "./Shard";
import { TickIcon } from "./icons";
import { heroBackground } from "./ui";

/**
 * The home page's building blocks, shared so section pages can carry the
 * same look: a black hero with a gold-block headline, a full-width red
 * band, and a gold banner. One Shard each, never more, and each page
 * passes its own shape and placement so no two heroes look alike.
 */

/** Which shard a band draws, and where (position, size, colour classes). */
export type ShardSpec = { shape: ShardShape; className: string };

/** Wrap one word of a headline in this for the gold block ("next ride"). */
export function HighlightWord({ children }: { children: ReactNode }) {
  return <span className="mt-2 inline-block bg-highlight px-3 pb-1 text-[#111]">{children}</span>;
}

/** Black hero: big headline, intro, optional red ticks, and room for a search box. */
export function BlockHero({
  title,
  intro,
  ticks,
  shard,
  gradient = false,
  compact = false,
  above,
  aside,
  children,
}: {
  /** A line above the headline: a back link or a badge. */
  above?: ReactNode;
  /** Smaller headline and padding, for working pages (edit, feature, account). */
  compact?: boolean;
  /** Use the red/gold glow (the search page's) instead of flat black. The client likes it; keep it where it already was. */
  gradient?: boolean;
  /** This page's own shard. Pick one no other hero uses. */
  shard: ShardSpec;
  title: ReactNode;
  intro?: ReactNode;
  ticks?: string[];
  /** A picture beside the text from `lg` (below it on phones): a dealer's shop photo. */
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section
      className={`relative overflow-hidden border-b border-line ${gradient ? "" : "bg-[#141416]"}`}
      style={gradient ? { background: heroBackground } : undefined}
    >
      <Shard shape={shard.shape} className={shard.className} />
      <div
        className={`relative mx-auto max-w-[1280px] px-5 ${compact ? "pt-9 pb-8 sm:pt-11 sm:pb-10" : "pt-12 pb-10 sm:pt-16 sm:pb-12"}`}
      >
        <div className={aside ? "grid gap-8 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:gap-12" : undefined}>
          <div>
            {above && <div className="mb-4">{above}</div>}
            <h1
              className={`font-display max-w-[760px] leading-none ${
                compact ? "text-[38px] sm:text-5xl" : "text-[44px] sm:text-6xl lg:text-7xl"
              }`}
            >
              {title}
            </h1>
            {intro && <p className="mt-5 max-w-[620px] text-[15px] text-[#d6d3cb] sm:text-base">{intro}</p>}
            {ticks && (
              <ul className="mt-5 grid max-w-[620px] gap-x-7 gap-y-2 text-sm text-[#d6d3cb] sm:grid-cols-2 sm:text-[15px]">
                {ticks.map((t) => (
                  <li key={t} className="flex items-center gap-2.5">
                    <TickIcon className="h-4 w-4 shrink-0 text-[#ff6b70]" />
                    {t}
                  </li>
                ))}
              </ul>
            )}
            {children && <div className="mt-8">{children}</div>}
          </div>
          {aside}
        </div>
      </div>
    </section>
  );
}

/** Full-width red band, as on the home page's events section. */
const HOME_RED_SHARD: ShardSpec = {
  shape: "double",
  className: "top-[-40px] left-[-140px] h-[560px] w-[520px] -rotate-[4deg] bg-black/[.16]",
};

export function RedBand({
  children,
  id,
  className = "",
  shard = HOME_RED_SHARD,
}: {
  children: ReactNode;
  id?: string;
  className?: string;
  shard?: ShardSpec;
}) {
  return (
    <section id={id} className={`relative scroll-mt-20 overflow-hidden bg-red text-white ${className}`}>
      <Shard shape={shard.shape} className={shard.className} />
      <div className="relative mx-auto max-w-[1280px] px-5 py-12 sm:py-14">{children}</div>
    </section>
  );
}

/** The small spaced label above a band heading ("Ride", "Fix & kit"). */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-display mb-1.5 text-[13px] font-normal tracking-[.2em]">{children}</p>;
}

/** The black button used on red and gold backgrounds. */
export const blackButton =
  "font-display inline-block bg-[#111] px-6 py-3.5 font-semibold tracking-[.08em] text-white outline-[3px] outline-offset-[3px] outline-red outline-solid transition hover:bg-black";

/** Gold banner with a black shard, as on the home page's "Sell your bike today". */
const HOME_GOLD_SHARD: ShardSpec = {
  shape: "double",
  className: "inset-y-0 right-0 hidden w-[46%] bg-[#111] opacity-90 md:block",
};

export function GoldBanner({
  title,
  body,
  action,
  shard = HOME_GOLD_SHARD,
}: {
  title: ReactNode;
  body: ReactNode;
  action?: ReactNode;
  shard?: ShardSpec;
}) {
  return (
    <section className="mx-auto max-w-[1280px] px-5">
      <div className="relative overflow-hidden bg-highlight px-6 py-9 text-[#111] sm:px-12 sm:py-11">
        <Shard shape={shard.shape} className={shard.className} />
        <div className="relative max-w-[620px]">
          <h2 className="font-display text-4xl leading-none sm:text-5xl">{title}</h2>
          <p className="mt-3 text-[17px] leading-normal">{body}</p>
          {action && <div className="mt-5">{action}</div>}
        </div>
      </div>
    </section>
  );
}

/**
 * The auth pages (log in, sign up, password reset): a black band with a
 * big gold-block line on the left and the form card on the right. Each page
 * passes its own shard. On phones the line sits above the form.
 */
export function AuthShell({
  line,
  ticks,
  shard,
  children,
}: {
  line: ReactNode;
  ticks?: string[];
  shard: ShardSpec;
  children: ReactNode;
}) {
  return (
    <main className="relative overflow-hidden bg-[#141416]">
      <Shard shape={shard.shape} className={shard.className} />
      <div className="relative mx-auto grid max-w-[1280px] items-center gap-10 px-5 py-12 lg:min-h-[640px] lg:grid-cols-2 lg:py-20">
        <div>
          <p className="font-display text-[44px] leading-none sm:text-6xl lg:text-7xl">{line}</p>
          {ticks && (
            <ul className="mt-6 space-y-2 text-[15px] text-[#d6d3cb]">
              {ticks.map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <TickIcon className="h-4 w-4 shrink-0 text-[#ff6b70]" />
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex lg:justify-end">{children}</div>
      </div>
    </main>
  );
}
