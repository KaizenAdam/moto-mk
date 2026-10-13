import type { ReactNode } from "react";

const tones = {
  /** Solid gold: earned trust marks (Verified, Dealer). */
  gold: "bg-gold text-[#141414]",
  /** Solid red: attention (Coming soon, Pending review, Rejected). */
  red: "bg-red text-white",
  green: "bg-green-700 text-white",
  /** Gold tint: secondary labels that shouldn't shout (a card's dealer name). */
  soft: "bg-gold/15 text-gold-bright",
  outline: "border border-gold bg-panel2 text-gold-bright",
  muted: "border border-line bg-panel2 text-ink-dim",
} as const;

const sizes = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-3 py-1 text-xs",
} as const;

export type BadgeTone = keyof typeof tones;

/** A small uppercase pill: statuses, trust marks, dates. */
export default function Badge({
  tone = "gold",
  size = "sm",
  className = "",
  children,
}: {
  tone?: BadgeTone;
  size?: keyof typeof sizes;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`font-display inline-block shrink-0 rounded-full font-semibold tracking-wider ${sizes[size]} ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
