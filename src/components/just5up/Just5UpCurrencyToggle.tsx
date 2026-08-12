"use client";

import { useCurrency } from "@/lib/currency";
import { j5u } from "@/lib/just5up-theme";

export default function Just5UpCurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      className="flex items-center rounded overflow-hidden text-xs font-[family-name:var(--font-jetbrains)] uppercase tracking-wider border"
      style={{ borderColor: j5u.borderStrong }}
    >
      {(["EUR", "MKD"] as const).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          aria-pressed={currency === c}
          className="px-2.5 py-1.5 transition-colors"
          style={
            currency === c
              ? { background: j5u.goldDeep, color: j5u.card }
              : { color: j5u.inkMuted }
          }
        >
          {c}
        </button>
      ))}
    </div>
  );
}
