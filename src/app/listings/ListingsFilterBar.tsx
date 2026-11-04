"use client";

import { useRouter, usePathname } from "next/navigation";
import { RIDING_STYLES, ENGINE_TYPES, CC_THRESHOLDS, PRICE_THRESHOLDS_EUR } from "@/lib/constants/listings";
import { toStringParam, withParam, type SearchParams } from "./queryParams";
import { CloseIcon } from "@/app/components/icons";
import { useI18n } from "@/app/components/I18nProvider";
import { fill, formatNumber } from "@/lib/i18n/format";

const FILTER_KEYS = ["make", "style", "engineType", "ccMax", "priceMax", "town"];

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
  const { locale, t } = useI18n();
  const f = t.filters;

  function setParam(key: string, value: string) {
    router.push(`${pathname}?${withParam(current, key, value)}`);
  }

  function clearAll() {
    router.push(pathname);
  }

  // Square selects; one that's narrowing the results gets the gold edge.
  const pill = (key: string) =>
    `border bg-panel2 py-2 pr-2 pl-3 text-[13px] outline-none focus:border-highlight ${
      toStringParam(current[key]) ? "border-highlight text-highlight" : "border-line text-ink"
    }`;
  const anySet = FILTER_KEYS.some((k) => toStringParam(current[k]));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label={f.make}
        className={pill("make")}
        value={toStringParam(current.make)}
        onChange={(e) => setParam("make", e.target.value)}
      >
        <option value="">{f.allMakes}</option>
        {makes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <select
        aria-label={f.style}
        className={pill("style")}
        value={toStringParam(current.style)}
        onChange={(e) => setParam("style", e.target.value)}
      >
        <option value="">{f.allStyles}</option>
        {RIDING_STYLES.map((s) => (
          <option key={s} value={s}>
            {t.styles[s] ?? s}
          </option>
        ))}
      </select>

      <select
        aria-label={f.engineType}
        className={pill("engineType")}
        value={toStringParam(current.engineType)}
        onChange={(e) => setParam("engineType", e.target.value)}
      >
        <option value="">{f.allEngineTypes}</option>
        {ENGINE_TYPES.map((e) => (
          <option key={e.value} value={e.value}>
            {t.engineTypes[e.value] ?? e.label}
          </option>
        ))}
      </select>

      <select
        aria-label={f.engineSize}
        className={pill("ccMax")}
        value={toStringParam(current.ccMax)}
        onChange={(e) => setParam("ccMax", e.target.value)}
      >
        <option value="">{f.anyEngineSize}</option>
        {CC_THRESHOLDS.map((cc) => (
          <option key={cc} value={cc}>
            {fill(f.upToCc, { cc })}
          </option>
        ))}
      </select>

      <select
        aria-label={f.price}
        className={pill("priceMax")}
        value={toStringParam(current.priceMax)}
        onChange={(e) => setParam("priceMax", e.target.value)}
      >
        <option value="">{f.anyPrice}</option>
        {PRICE_THRESHOLDS_EUR.map((p) => (
          <option key={p} value={p}>
            {fill(f.upToPrice, { price: formatNumber(locale, p) })}
          </option>
        ))}
      </select>

      <select
        aria-label={f.town}
        className={pill("town")}
        value={toStringParam(current.town)}
        onChange={(e) => setParam("town", e.target.value)}
      >
        <option value="">{t.common.allOfMacedonia}</option>
        {towns.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      {anySet && (
        <button
          type="button"
          onClick={clearAll}
          className="flex items-center gap-1 px-2 py-2 text-xs text-ink-dim hover:text-white"
        >
          <CloseIcon className="h-3.5 w-3.5" />
          {f.clear}
        </button>
      )}
    </div>
  );
}
