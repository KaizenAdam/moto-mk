import type { ReactNode } from "react";

const sizes = {
  sm: "px-1.5 py-0.5 text-[11px]",
  md: "px-2 py-1 text-xs",
} as const;

/** A spec chip (600cc, 4-stroke, Naked) on cards and listing pages. */
export default function Chip({
  size = "sm",
  children,
}: {
  size?: keyof typeof sizes;
  children: ReactNode;
}) {
  return (
    <span className={`rounded border border-line bg-panel2 text-ink-dim ${sizes[size]}`}>
      {children}
    </span>
  );
}
