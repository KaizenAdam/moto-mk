import type { ReactNode } from "react";
import Shard from "./Shard";
import { TickIcon } from "./icons";

/**
 * The home page's building blocks, shared so section pages can carry the
 * same look: a black hero with a gold-block headline, a full-width red
 * band, and a gold banner. One Shard each, never more.
 */

/** Wrap one word of a headline in this for the gold block ("next ride"). */
export function HighlightWord({ children }: { children: ReactNode }) {
  return <span className="mt-2 inline-block bg-highlight px-3 pb-1 text-[#111]">{children}</span>;
}

/** Black hero: big headline, intro, optional red ticks, and room for a search box. */
export function BlockHero({
  title,
  intro,
  ticks,
  children,
}: {
  title: ReactNode;
  intro?: ReactNode;
  ticks?: string[];
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-[#141416]">
      <Shard shape="torn" className="top-[-30%] right-[-120px] h-[160%] w-[380px] rotate-[8deg] bg-red/[.22] sm:right-[4%] sm:w-[520px]" />
      <div className="relative mx-auto max-w-[1280px] px-5 pt-12 pb-10 sm:pt-16 sm:pb-12">
        <h1 className="font-display max-w-[760px] text-[44px] leading-none sm:text-6xl lg:text-7xl">{title}</h1>
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
    </section>
  );
}

/** Full-width red band, as on the home page's events section. */
export function RedBand({ children, id, className = "" }: { children: ReactNode; id?: string; className?: string }) {
  return (
    <section id={id} className={`relative scroll-mt-20 overflow-hidden bg-red text-white ${className}`}>
      <Shard className="top-[-40px] left-[-140px] h-[560px] w-[520px] -rotate-[4deg] bg-black/[.16]" />
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
export function GoldBanner({ title, body, action }: { title: ReactNode; body: ReactNode; action?: ReactNode }) {
  return (
    <section className="mx-auto max-w-[1280px] px-5">
      <div className="relative overflow-hidden bg-highlight px-6 py-9 text-[#111] sm:px-12 sm:py-11">
        <Shard className="inset-y-0 right-0 hidden w-[46%] bg-[#111] opacity-90 md:block" />
        <div className="relative max-w-[620px]">
          <h2 className="font-display text-4xl leading-none sm:text-5xl">{title}</h2>
          <p className="mt-3 text-[17px] leading-normal">{body}</p>
          {action && <div className="mt-5">{action}</div>}
        </div>
      </div>
    </section>
  );
}
