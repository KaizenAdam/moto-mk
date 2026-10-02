"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import Link from "next/link";
import type { Tables } from "@/lib/database.types";
import { updateStorefrontAction, type FormState } from "@/app/actions/garage";
import { TOWNS } from "@/lib/constants/listings";

const initialState: FormState = { error: null };
const inputClass =
  "mt-1 w-full rounded-md border border-line bg-panel2 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold";
const labelClass = "block text-xs font-bold tracking-wide text-ink-dim uppercase";

export default function StorefrontForm({ dealer }: { dealer: Tables<"dealers"> }) {
  const [state, formAction, pending] = useActionState(updateStorefrontAction, initialState);

  // onSubmit instead of <form action>: React resets a form after its action,
  // which would blank these fields on a validation error.
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <form onSubmit={submit} className="space-y-3.5">
      <p className="text-sm text-ink-dim">
        {dealer.active ? (
          <>
            Live at{" "}
            <Link href={`/dealers/${dealer.slug}`} className="text-gold-bright hover:underline">
              /dealers/{dealer.slug}
            </Link>
          </>
        ) : (
          "Your storefront is switched off while your dealer account is inactive."
        )}
      </p>
      <label className={labelClass}>
        Business name <span className="text-red">*</span>
        <input name="business_name" required maxLength={120} defaultValue={dealer.business_name} className={inputClass} />
      </label>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <label className={labelClass}>
          Town
          <select name="town" defaultValue={dealer.town ?? ""} className={inputClass}>
            <option value="">—</option>
            {TOWNS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Shop phone (public)
          <input name="phone" type="tel" defaultValue={dealer.phone ?? ""} className={inputClass} />
        </label>
      </div>
      <label className={labelClass}>
        Address
        <input name="address" defaultValue={dealer.address ?? ""} className={inputClass} />
      </label>
      <label className={labelClass}>
        About your business
        <textarea
          name="about"
          rows={4}
          maxLength={2000}
          defaultValue={dealer.about ?? ""}
          placeholder="Brands you stock, servicing, finance, opening hours…"
          className={`${inputClass} normal-case`}
        />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gradient-to-br from-gold-bright to-gold px-4 py-2 text-xs font-bold tracking-wide text-[#141414] uppercase disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save storefront"}
        </button>
        {state.error && <span className="text-xs text-red">{state.error}</span>}
        {state.message && <span className="text-xs text-gold-bright">{state.message}</span>}
      </div>
    </form>
  );
}
