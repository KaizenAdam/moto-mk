import type { ReactNode } from "react";
import { heroBackground } from "./ui";

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
  children,
}: {
  title: ReactNode;
  intro?: ReactNode;
  width?: keyof typeof widths;
  /** lg for the home page's headline, md everywhere else. */
  size?: "md" | "lg";
  children?: ReactNode;
}) {
  return (
    <section
      className={`border-b border-line px-5 ${size === "lg" ? "py-10 sm:py-12" : "py-8"}`}
      style={{ background: heroBackground }}
    >
      <div className={`mx-auto ${widths[width]}`}>
        <h1
          className={`font-display mb-2 ${
            size === "lg" ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"
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
