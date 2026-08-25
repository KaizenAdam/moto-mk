"use client";

import { useRouter, usePathname } from "next/navigation";
import { withParam, type SearchParams } from "./queryParams";
import type { Currency } from "@/lib/constants/listings";

export default function CurrencyToggle({
  current,
  searchParams,
}: {
  current: Currency;
  searchParams: SearchParams;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function setCurrency(cur: Currency) {
    router.push(`${pathname}?${withParam(searchParams, "cur", cur === "EUR" ? "" : cur)}`);
  }

  const base = "px-3 py-1.5 text-xs font-bold";
  return (
    <div className="flex overflow-hidden rounded-full border border-line bg-panel2">
      <button
        type="button"
        onClick={() => setCurrency("EUR")}
        className={`${base} ${current === "EUR" ? "bg-red text-white" : "text-ink-dim"}`}
      >
        EUR €
      </button>
      <button
        type="button"
        onClick={() => setCurrency("MKD")}
        className={`${base} ${current === "MKD" ? "bg-red text-white" : "text-ink-dim"}`}
      >
        MKD
      </button>
    </div>
  );
}
