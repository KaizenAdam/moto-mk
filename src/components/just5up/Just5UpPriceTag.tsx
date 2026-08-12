"use client";

import { useCurrency } from "@/lib/currency";
import { j5u } from "@/lib/just5up-theme";

export default function Just5UpPriceTag({ priceEur }: { priceEur: number }) {
  const { format } = useCurrency();

  return (
    <span
      className="font-[family-name:var(--font-anton)] text-lg tracking-wide"
      style={{ color: j5u.goldDeep }}
    >
      {format(priceEur)}
    </span>
  );
}
