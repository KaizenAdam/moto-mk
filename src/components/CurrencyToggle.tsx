"use client";

import { useCurrency } from "@/lib/currency";

export default function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center rounded-full border border-tarmac-line overflow-hidden text-xs font-data uppercase tracking-wider">
      {(["EUR", "MKD"] as const).map((c) => (
        <button
          key={c}
          onClick={() => setCurrency(c)}
          aria-pressed={currency === c}
          className={`px-2.5 py-1 transition-colors ${
            currency === c
              ? "bg-amber text-tarmac"
              : "text-paper/70 hover:text-paper"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
