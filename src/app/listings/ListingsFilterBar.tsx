"use client";

import { useRouter, usePathname } from "next/navigation";
import { RIDING_STYLES, ENGINE_TYPES, CC_THRESHOLDS, PRICE_THRESHOLDS_EUR } from "@/lib/constants/listings";

type SearchParams = Record<string, string | string[] | undefined>;

function toStringParam(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

export default function ListingsFilterBar({
  makes,
  towns,
  current,
}: {
  makes: string[];
  towns: string[];
  current: SearchParams;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(current)) {
      const s = toStringParam(v);
      if (s) params.set(k, s);
    }
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  const selectClass =
    "rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400";

  return (
    <div className="flex flex-wrap gap-3">
      <select
        className={selectClass}
        value={toStringParam(current.make)}
        onChange={(e) => setParam("make", e.target.value)}
      >
        <option value="">All makes</option>
        {makes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={toStringParam(current.style)}
        onChange={(e) => setParam("style", e.target.value)}
      >
        <option value="">All riding styles</option>
        {RIDING_STYLES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={toStringParam(current.engineType)}
        onChange={(e) => setParam("engineType", e.target.value)}
      >
        <option value="">All engine types</option>
        {ENGINE_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={toStringParam(current.town)}
        onChange={(e) => setParam("town", e.target.value)}
      >
        <option value="">All towns</option>
        {towns.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={toStringParam(current.ccMax)}
        onChange={(e) => setParam("ccMax", e.target.value)}
      >
        <option value="">Any cc</option>
        {CC_THRESHOLDS.map((cc) => (
          <option key={cc} value={cc}>
            Up to {cc}cc
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={toStringParam(current.priceMax)}
        onChange={(e) => setParam("priceMax", e.target.value)}
      >
        <option value="">Any price</option>
        {PRICE_THRESHOLDS_EUR.map((p) => (
          <option key={p} value={p}>
            Up to €{p.toLocaleString()}
          </option>
        ))}
      </select>
    </div>
  );
}
