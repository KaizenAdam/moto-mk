import type { ReactNode } from "react";
import { heroBackground } from "./ui";
import Shard from "./Shard";

const widths = {
  wide: "max-w-[1280px]",
  narrow: "max-w-[1100px]",
} as const;

/**
 * The glow-backed band at the top of a section page: title, a line of
 * intro, and optionally more (the home page's search bar).
 */
export default function PageHero({
  title,
  intro,
  width = "wide",
  size = "md",
  shard = false,
  children,
}: {
  title: ReactNode;
  intro?: ReactNode;
  width?: keyof typeof widths;
  /** lg for a big headline (the search page), md everywhere else. */
  size?: "md" | "lg";
  /** Throw the brand's torn shard in behind the right-hand side. */
  shard?: boolean;
  children?: ReactNode;
}) {
  return (
    <section
      className={`relative overflow-hidden border-b border-line px-5 ${size === "lg" ? "py-10 sm:py-14" : "py-8"}`}
      style={{ background: heroBackground }}
    >
      {shard && (
        <Shard shape="torn" className="top-[-35%] right-[-40px] h-[170%] w-[300px] rotate-[8deg] bg-highlight/[.10] sm:right-[5%] sm:w-[440px]" />
      )}
      <div className={`relative mx-auto ${widths[width]}`}>
        <h1
          className={`font-display mb-2 ${
            size === "lg" ? "text-[42px] leading-none sm:text-6xl" : "text-3xl sm:text-4xl"
          }`}
        >
          {title}
        </h1>
        {intro && <p className="max-w-2xl text-sm text-ink-dim sm:text-[15px]">{intro}</p>}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </section>
  );
}
