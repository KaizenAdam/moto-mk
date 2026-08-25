"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createListingAction, type CreateListingState } from "@/app/actions/listings";
import { RIDING_STYLES, ENGINE_TYPES, formatPrice } from "@/lib/constants/listings";
import { PinIcon } from "@/app/components/icons";

const initialState: CreateListingState = { error: null, listing: null };

const TOWNS = ["Skopje", "Ohrid", "Bitola", "Kumanovo", "Tetovo", "Struga"];

type PreviewData = {
  make: string;
  model: string;
  price: number;
  cc: number;
  engineType: string;
  style: string;
  town: string;
};

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-panel2 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold";
const labelClass = "block text-xs font-bold tracking-wide text-ink-dim uppercase";
const sectionTitleClass = "mb-4 border-b border-line pb-2.5 text-[15px] font-bold tracking-wide text-gold uppercase";

function PreviewCard({ data }: { data: PreviewData }) {
  const price = formatPrice(data.price || 0, "EUR");
  return (
    <div className="overflow-hidden rounded-[10px] border border-line bg-panel">
      <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-[#26262b] to-[#18181b] text-[13px] text-grey">
        No photo yet
      </div>
      <div className="px-3 pt-2.5 pb-3">
        <div className="truncate text-sm font-bold text-ink">
          {data.make || "Make"} {data.model || "Model"}
        </div>
        <div className="mb-1.5 text-base font-extrabold text-gold-bright">
          {data.price ? price.main : "€0"}{" "}
          <span className="ml-1 text-[11px] font-normal text-grey">{data.price ? price.alt : ""}</span>
        </div>
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          <span className="rounded border border-line bg-panel2 px-1.5 py-0.5 text-[11px] text-ink-dim">
            {data.cc || 0}cc
          </span>
          <span className="rounded border border-line bg-panel2 px-1.5 py-0.5 text-[11px] text-ink-dim">
            {data.engineType}
          </span>
          <span className="rounded border border-line bg-panel2 px-1.5 py-0.5 text-[11px] text-ink-dim">
            {data.style}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-grey">
          <PinIcon />
          {data.town}
        </div>
      </div>
    </div>
  );
}

export default function SellForm() {
  const [state, formAction, pending] = useActionState(createListingAction, initialState);
  const [preview, setPreview] = useState<PreviewData>({
    make: "",
    model: "",
    price: 0,
    cc: 0,
    engineType: "4-stroke",
    style: "Naked",
    town: "Skopje",
  });

  function update<K extends keyof PreviewData>(key: K, value: PreviewData[K]) {
    setPreview((p) => ({ ...p, [key]: value }));
  }

  if (state.listing) {
    return (
      <div className="mx-auto max-w-[520px] px-5 py-14 text-center">
        <span className="mb-4 inline-block rounded-full bg-red px-3 py-1.5 text-[11px] font-bold tracking-wide text-white uppercase">
          Pending review
        </span>
        <h1 className="font-display mb-2.5 text-[28px]">Your listing has been submitted</h1>
        <p className="mb-5 text-sm text-ink-dim">
          <strong className="text-ink">{state.listing.title}</strong> won&rsquo;t be visible to
          buyers until an admin approves it — we&rsquo;ll keep it out of search until then.
        </p>
        <div className="mx-auto mb-6 max-w-[300px] text-left">
          <PreviewCard data={preview} />
        </div>
        <Link
          href="/listings"
          className="inline-block rounded-md bg-gradient-to-br from-gold-bright to-gold px-5 py-2.5 text-sm font-bold tracking-wide text-[#141414] uppercase"
        >
          Back to listings
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="mx-auto grid max-w-[1100px] grid-cols-1 gap-8 px-5 py-8 md:grid-cols-[1fr_300px]">
      <div>
        {state.error && (
          <p className="mb-4 rounded-md bg-red/20 px-3 py-2 text-sm text-gold-bright">{state.error}</p>
        )}

        <div className="mb-7">
          <h2 className={sectionTitleClass}>The bike</h2>
          <div className="mb-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <label className={labelClass}>
              Make <span className="text-red">*</span>
              <input
                name="make"
                required
                placeholder="e.g. Yamaha"
                className={inputClass}
                onChange={(e) => update("make", e.target.value)}
              />
            </label>
            <label className={labelClass}>
              Model <span className="text-red">*</span>
              <input
                name="model"
                required
                placeholder="e.g. MT-07"
                className={inputClass}
                onChange={(e) => update("model", e.target.value)}
              />
            </label>
          </div>
          <div className="mb-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <label className={labelClass}>
              Year
              <input name="year" type="number" min="1970" max="2026" placeholder="2020" className={inputClass} />
            </label>
            <label className={labelClass}>
              Engine size (cc)
              <input
                name="engine_cc"
                type="number"
                min="0"
                placeholder="650"
                className={inputClass}
                onChange={(e) => update("cc", Number(e.target.value))}
              />
            </label>
          </div>
          <div className="mb-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <label className={labelClass}>
              Engine type
              <select
                name="engine_type"
                defaultValue="4-stroke"
                className={inputClass}
                onChange={(e) => update("engineType", e.target.value)}
              >
                {ENGINE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Riding style
              <select
                name="riding_style"
                defaultValue="Naked"
                className={inputClass}
                onChange={(e) => update("style", e.target.value)}
              >
                {RIDING_STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className={labelClass}>
            Mileage (km)
            <input name="mileage_km" type="number" min="0" placeholder="14200" className={inputClass} />
          </label>
        </div>

        <div className="mb-7">
          <h2 className={sectionTitleClass}>Price &amp; location</h2>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <label className={labelClass}>
              Price (€) <span className="text-red">*</span>
              <input
                name="price_eur"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="6400"
                className={inputClass}
                onChange={(e) => update("price", Number(e.target.value))}
              />
            </label>
            <label className={labelClass}>
              Town
              <select
                name="town"
                defaultValue="Skopje"
                className={inputClass}
                onChange={(e) => update("town", e.target.value)}
              >
                {TOWNS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mb-7">
          <h2 className={sectionTitleClass}>Photos</h2>
          <div className="rounded-[10px] border-2 border-dashed border-line px-5 py-7 text-center text-[13px] text-ink-dim">
            Photo upload isn&rsquo;t available yet
            <div className="mt-1.5 text-xs text-grey">Coming soon</div>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-gradient-to-br from-gold-bright to-gold px-4 py-3.5 text-sm font-bold tracking-wide text-[#141414] uppercase transition hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Submitting…" : "List my bike"}
        </button>
      </div>

      <div className="self-start md:sticky md:top-24">
        <div className="mb-2.5 text-xs tracking-wide text-ink-dim uppercase">Live preview</div>
        <PreviewCard data={preview} />
      </div>
    </form>
  );
}
