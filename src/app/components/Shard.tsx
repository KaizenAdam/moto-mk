import type { CSSProperties } from "react";

/**
 * The brand's one decorative motif: an irregular, torn-looking shard cut
 * from the A3 mock-up's banner shape. Purely decorative (aria-hidden).
 * Position, size and colour come from `className`/`style`; the parent needs
 * `relative overflow-hidden`, and content above it needs `relative`.
 */
const SHAPES = {
  /** Two jagged chevrons side by side — the home page's red band and sell banner. */
  double:
    "22% 0, 44% 0, 70% 50%, 44% 100%, 22% 100%, 48% 50%, 22% 0, 62% 0, 84% 0, 100% 50%, 84% 100%, 62% 100%, 88% 50%",
  torn: "10% 0, 38% 0, 61% 38%, 52% 47%, 79% 100%, 46% 100%, 30% 62%, 41% 51%",
  bent: "18% 0, 49% 6%, 83% 41%, 61% 58%, 92% 100%, 52% 96%, 29% 63%, 47% 47%",
  sliver: "0 8%, 34% 0, 72% 46%, 40% 100%, 14% 92%, 44% 52%",
} as const;

export default function Shard({
  shape = "double",
  className = "",
  style,
}: {
  shape?: keyof typeof SHAPES;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute ${className}`}
      style={{ clipPath: `polygon(${SHAPES[shape]})`, ...style }}
    />
  );
}
