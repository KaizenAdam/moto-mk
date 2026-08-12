"use client";

import { useMemo, useState } from "react";
import { listings as allListings, makes, towns } from "@/lib/listings";
import { EngineType, RidingStyle, Town } from "@/lib/types";
import Just5UpListingCard from "./Just5UpListingCard";
import { j5u } from "@/lib/just5up-theme";
import { useCurrency } from "@/lib/currency";

const STYLES: RidingStyle[] = [
  "Enduro",
  "Sport",
  "Cruiser",
  "Scooter",
  "Touring",
  "Naked",
  "Adventure",
];
const ENGINE_TYPES: EngineType[] = ["2-stroke", "4-stroke", "electric"];

const CC_BANDS = [
  { label: "Any engine size", value: 1300 },
  { label: "Up to 125cc", value: 125 },
  { label: "Up to 400cc", value: 400 },
  { label: "Up to 700cc", value: 700 },
  { label: "Up to 1000cc", value: 1000 },
];
const PRICE_BAND_VALUES = [20000, 3000, 5000, 8000, 12000];

function PillSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className="rounded-full px-3.5 py-2 text-sm cursor-pointer"
      style={{
        background: j5u.card,
        color: value ? j5u.ink : j5u.inkMuted,
        border: `1px solid ${j5u.borderStrong}`,
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export default function Just5UpListingsBrowser({
  initialMake = "",
  initialStyle = "",
}: {
  initialMake?: string;
  initialStyle?: string;
}) {
  const { format } = useCurrency();
  const [make, setMake] = useState(initialMake);
  const [style, setStyle] = useState(initialStyle);
  const [town, setTown] = useState("");
  const [engineType, setEngineType] = useState("");
  const [priceMax, setPriceMax] = useState(PRICE_BAND_VALUES[0]);
  const [ccMax, setCcMax] = useState(CC_BANDS[0].value);
  const [sort, setSort] = useState<"newest" | "price-asc" | "price-desc">("newest");

  const priceBands = useMemo(
    () =>
      PRICE_BAND_VALUES.map((value, i) => ({
        value,
        label: i === 0 ? "Any price" : `Up to ${format(value)}`,
      })),
    [format]
  );

  const filtered = useMemo(() => {
    let results = allListings.filter((l) => {
      if (make && l.make !== make) return false;
      if (style && l.ridingStyle !== style) return false;
      if (town && l.town !== (town as Town)) return false;
      if (engineType && l.engineType !== engineType) return false;
      if (l.priceEur > priceMax) return false;
      if (l.cc > ccMax) return false;
      return true;
    });

    results = [...results].sort((a, b) => {
      if (sort === "price-asc") return a.priceEur - b.priceEur;
      if (sort === "price-desc") return b.priceEur - a.priceEur;
      return a.postedDaysAgo - b.postedDaysAgo;
    });

    return results;
  }, [make, style, town, engineType, priceMax, ccMax, sort]);

  function resetFilters() {
    setMake("");
    setStyle("");
    setTown("");
    setEngineType("");
    setPriceMax(PRICE_BAND_VALUES[0]);
    setCcMax(CC_BANDS[0].value);
  }

  return (
    <div style={{ background: j5u.bg }}>
      <div
        className="w-full px-4 md:px-8 py-4 flex flex-wrap items-center gap-2 border-b"
        style={{ borderColor: j5u.border }}
      >
        <PillSelect
          ariaLabel="Make"
          value={make}
          onChange={setMake}
          options={[{ value: "", label: "Make and model" }, ...makes.map((m) => ({ value: m, label: m }))]}
        />
        <PillSelect
          ariaLabel="Riding style"
          value={style}
          onChange={setStyle}
          options={[{ value: "", label: "Riding style" }, ...STYLES.map((s) => ({ value: s, label: s }))]}
        />
        <PillSelect
          ariaLabel="Engine type"
          value={engineType}
          onChange={setEngineType}
          options={[{ value: "", label: "Engine type" }, ...ENGINE_TYPES.map((e) => ({ value: e, label: e }))]}
        />
        <PillSelect
          ariaLabel="Max engine size"
          value={String(ccMax)}
          onChange={(v) => setCcMax(Number(v))}
          options={CC_BANDS.map((b) => ({ value: String(b.value), label: b.label }))}
        />
        <PillSelect
          ariaLabel="Max price"
          value={String(priceMax)}
          onChange={(v) => setPriceMax(Number(v))}
          options={priceBands.map((b) => ({ value: String(b.value), label: b.label }))}
        />
        <PillSelect
          ariaLabel="Location"
          value={town}
          onChange={setTown}
          options={[{ value: "", label: "Location" }, ...towns.map((t) => ({ value: t, label: t }))]}
        />
        <button
          onClick={resetFilters}
          className="text-sm font-medium ml-1 hover:underline"
          style={{ color: j5u.red }}
        >
          Reset
        </button>
      </div>

      <div className="w-full px-4 md:px-8 py-5">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <p className="text-sm" style={{ color: j5u.inkMuted }}>
            <span className="font-semibold text-base" style={{ color: j5u.ink }}>
              {filtered.length}
            </span>{" "}
            bikes found
          </p>
          <PillSelect
            ariaLabel="Sort by"
            value={sort}
            onChange={(v) => setSort(v as typeof sort)}
            options={[
              { value: "newest", label: "Newest first" },
              { value: "price-asc", label: "Price: low to high" },
              { value: "price-desc", label: "Price: high to low" },
            ]}
          />
        </div>

        {filtered.length === 0 ? (
          <div
            className="rounded-md border border-dashed py-16 text-center"
            style={{ borderColor: j5u.borderStrong }}
          >
            <p className="font-semibold text-lg mb-2" style={{ color: j5u.ink }}>
              No bikes match those filters
            </p>
            <button
              onClick={resetFilters}
              className="text-sm underline underline-offset-4"
              style={{ color: j5u.red }}
            >
              Clear filters and start again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((listing) => (
              <Just5UpListingCard key={listing.slug} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
