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
  const base = "font-display px-3 py-2 text-xs font-medium tracking-wider";
  return (
    <div className="flex border border-line bg-panel2" role="group" aria-label="Currency">
      <button
        type="button"
        onClick={() => onChange("EUR")}
        aria-pressed={value === "EUR"}
        className={`${base} ${value === "EUR" ? "bg-white text-[#111]" : "text-ink-dim hover:text-white"}`}
      >
        EUR €
      </button>
      <button
        type="button"
        onClick={() => onChange("MKD")}
        aria-pressed={value === "MKD"}
        className={`${base} ${value === "MKD" ? "bg-white text-[#111]" : "text-ink-dim hover:text-white"}`}
      >
        MKD
      </button>
    </div>
  );
}
