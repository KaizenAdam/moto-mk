"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createListingAction, type CreateListingState } from "@/app/actions/listings";
import { RIDING_STYLES, ENGINE_TYPES } from "@/lib/constants/listings";

const initialState: CreateListingState = { error: null, listing: null };

const inputClass =
  "mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-amber-400";
const labelClass = "block text-sm text-zinc-300";

export default function SellPage() {
  const [state, formAction, pending] = useActionState(createListingAction, initialState);

  if (state.listing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 text-center">
        <div className="max-w-md rounded-lg border border-zinc-800 bg-zinc-950 p-8">
          <h1 className="mb-3 text-2xl font-bold text-amber-400">Listing submitted</h1>
          <p className="text-sm text-zinc-300">
            <strong className="text-white">{state.listing.title}</strong> is now pending
            review. It won&rsquo;t be visible to buyers until an admin approves it — we&rsquo;ll
            keep it out of search until then.
          </p>
          <Link
            href="/listings"
            className="mt-6 inline-block rounded bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300"
          >
            Back to listings
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white">
      <form
        action={formAction}
        className="mx-auto max-w-lg rounded-lg border border-zinc-800 bg-zinc-950 p-8"
      >
        <h1 className="mb-6 text-2xl font-bold text-amber-400">List a bike</h1>

        {state.error && (
          <p className="mb-4 rounded bg-red-950 px-3 py-2 text-sm text-red-400">{state.error}</p>
        )}

        <div className="space-y-4">
          <label className={labelClass}>
            Title
            <input name="title" required className={inputClass} placeholder="2018 Yamaha MT-07" />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className={labelClass}>
              Make
              <input name="make" required className={inputClass} />
            </label>
            <label className={labelClass}>
              Model
              <input name="model" required className={inputClass} />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className={labelClass}>
              Year
              <input name="year" type="number" className={inputClass} />
            </label>
            <label className={labelClass}>
              Price (EUR)
              <input name="price_eur" type="number" step="0.01" required className={inputClass} />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className={labelClass}>
              Engine (cc)
              <input name="engine_cc" type="number" className={inputClass} />
            </label>
            <label className={labelClass}>
              Mileage (km)
              <input name="mileage_km" type="number" className={inputClass} />
            </label>
          </div>

          <label className={labelClass}>
            Engine type
            <select name="engine_type" className={inputClass} defaultValue="">
              <option value="">—</option>
              {ENGINE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            Riding style
            <select name="riding_style" className={inputClass} defaultValue="">
              <option value="">—</option>
              {RIDING_STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            Town
            <input name="town" className={inputClass} />
          </label>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded bg-amber-400 px-4 py-2 font-semibold text-black transition hover:bg-amber-300 disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Submit for review"}
        </button>
      </form>
    </main>
  );
}
