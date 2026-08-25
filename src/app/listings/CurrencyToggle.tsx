"use client";

import type { Currency } from "@/lib/constants/listings";

/**
 * Pure client-side display toggle — currency never changes which rows come
 * back from the server, only how the same price is formatted, so this has
 * no business touching the network (it used to push a `cur` query param,
 * which re-ran the whole page's data fetching just to reformat a number).
 */
export default function CurrencyToggle({
  value,
  onChange,
}: {
  value: Currency;
  onChange: (currency: Currency) => void;
}) {
  const base = "px-3 py-1.5 text-xs font-bold";
  return (
    <div className="flex overflow-hidden rounded-full border border-line bg-panel2">
      <button
        type="button"
        onClick={() => onChange("EUR")}
        className={`${base} ${value === "EUR" ? "bg-red text-white" : "text-ink-dim"}`}
      >
        EUR €
      </button>
      <button
        type="button"
        onClick={() => onChange("MKD")}
        className={`${base} ${value === "MKD" ? "bg-red text-white" : "text-ink-dim"}`}
      >
        MKD
      </button>
    </div>
  );
}
