"use client";

import { useRouter, usePathname } from "next/navigation";
import { RIDING_STYLES, ENGINE_TYPES, CC_THRESHOLDS, PRICE_THRESHOLDS_EUR } from "@/lib/constants/listings";
import { toStringParam, withParam, type SearchParams } from "./queryParams";

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
    router.push(`${pathname}?${withParam(current, key, value)}`);
  }

  function clearAll() {
    router.push(pathname);
  }

  const pillClass =
    "rounded-full border border-line bg-panel2 px-3.5 py-2 text-[13px] text-ink outline-none focus:border-gold";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select className={pillClass} value={toStringParam(current.make)} onChange={(e) => setParam("make", e.target.value)}>
        <option value="">All makes</option>
        {makes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <select className={pillClass} value={toStringParam(current.style)} onChange={(e) => setParam("style", e.target.value)}>
        <option value="">All riding styles</option>
        {RIDING_STYLES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        className={pillClass}
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

      <select className={pillClass} value={toStringParam(current.ccMax)} onChange={(e) => setParam("ccMax", e.target.value)}>
        <option value="">Any engine size</option>
        {CC_THRESHOLDS.map((cc) => (
          <option key={cc} value={cc}>
            Up to {cc}cc
          </option>
        ))}
      </select>

      <select
        className={pillClass}
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

      <select className={pillClass} value={toStringParam(current.town)} onChange={(e) => setParam("town", e.target.value)}>
        <option value="">All of North Macedonia</option>
        {towns.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <span onClick={clearAll} className="cursor-pointer px-1 py-2 text-xs text-grey hover:text-red">
        Clear all
      </span>
    </div>
  );
}
