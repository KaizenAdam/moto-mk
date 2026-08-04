"use client";

import { useMemo, useState } from "react";
import { listings as allListings, makes, towns } from "@/lib/listings";
import { EngineType, LicenseCategory, RidingStyle, Town } from "@/lib/types";
import ListingCard from "./ListingCard";

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
const LICENSES: LicenseCategory[] = ["AM", "A1", "A2", "A"];
const MAX_PRICE = 20000;
const MAX_CC = 1300;

export default function ListingsBrowser({
  initialMake = "",
  initialStyle = "",
}: {
  initialMake?: string;
  initialStyle?: string;
}) {
  const [make, setMake] = useState(initialMake);
  const [style, setStyle] = useState(initialStyle);
  const [town, setTown] = useState("");
  const [engineType, setEngineType] = useState("");
  const [license, setLicense] = useState("");
  const [priceMax, setPriceMax] = useState(MAX_PRICE);
  const [ccMax, setCcMax] = useState(MAX_CC);
  const [sort, setSort] = useState<"newest" | "price-asc" | "price-desc">("newest");

  const filtered = useMemo(() => {
    let results = allListings.filter((l) => {
      if (make && l.make !== make) return false;
      if (style && l.ridingStyle !== style) return false;
      if (town && l.town !== (town as Town)) return false;
      if (engineType && l.engineType !== engineType) return false;
      if (license && l.licenseCategory !== license) return false;
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
  }, [make, style, town, engineType, license, priceMax, ccMax, sort]);

  function resetFilters() {
    setMake("");
    setStyle("");
    setTown("");
    setEngineType("");
    setLicense("");
    setPriceMax(MAX_PRICE);
    setCcMax(MAX_CC);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
      <aside className="lg:sticky lg:top-20 lg:self-start bg-concrete rounded-xl p-5 border border-tarmac-line/10 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display uppercase text-sm tracking-widest text-steel-dark">
            Filters
          </h2>
          <button
            onClick={resetFilters}
            className="text-xs font-body text-rally hover:underline"
          >
            Reset
          </button>
        </div>

        <FilterGroup label="Make">
          <select
            value={make}
            onChange={(e) => setMake(e.target.value)}
            className="filter-select"
          >
            <option value="">All makes</option>
            {makes.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </FilterGroup>

        <FilterGroup label="Riding style">
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="filter-select"
          >
            <option value="">All styles</option>
            {STYLES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </FilterGroup>

        <FilterGroup label="Licence category">
          <select
            value={license}
            onChange={(e) => setLicense(e.target.value)}
            className="filter-select"
          >
            <option value="">All categories</option>
            {LICENSES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </FilterGroup>

        <FilterGroup label="Engine type">
          <select
            value={engineType}
            onChange={(e) => setEngineType(e.target.value)}
            className="filter-select"
          >
            <option value="">All engine types</option>
            {ENGINE_TYPES.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </FilterGroup>

        <FilterGroup label="Location">
          <select
            value={town}
            onChange={(e) => setTown(e.target.value)}
            className="filter-select"
          >
            <option value="">All towns</option>
            {towns.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </FilterGroup>

        <FilterGroup label={`Max engine size — ${ccMax === MAX_CC ? "any" : `${ccMax}cc`}`}>
          <input
            type="range"
            min={50}
            max={MAX_CC}
            step={50}
            value={ccMax}
            onChange={(e) => setCcMax(Number(e.target.value))}
            className="w-full accent-rally"
          />
        </FilterGroup>

        <FilterGroup label={`Max price — ${priceMax === MAX_PRICE ? "any" : `€${priceMax.toLocaleString()}`}`}>
          <input
            type="range"
            min={1000}
            max={MAX_PRICE}
            step={500}
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            className="w-full accent-rally"
          />
        </FilterGroup>
      </aside>

      <div>
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <p className="text-sm text-steel-dark font-body">
            <span className="font-display text-lg text-tarmac">{filtered.length}</span> bikes found
          </p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="filter-select w-auto"
            aria-label="Sort by"
          >
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-steel/40 py-16 text-center">
            <p className="font-display uppercase text-lg text-steel-dark mb-2">
              No bikes match those filters
            </p>
            <button
              onClick={resetFilters}
              className="text-sm text-rally underline underline-offset-4"
            >
              Clear filters and start again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((listing) => (
              <ListingCard key={listing.slug} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-data uppercase tracking-wide text-steel-dark mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
