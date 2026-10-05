"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import Link from "next/link";
import type { Tables } from "@/lib/database.types";
import { updateStorefrontAction, type FormState } from "@/app/actions/garage";
import { TOWNS } from "@/lib/constants/listings";
import { toast } from "@/app/components/Toaster";
import { input as inputClass, label as labelClass, button } from "@/app/components/ui";

const initialState: FormState = { error: null };

export default function StorefrontForm({ dealer }: { dealer: Tables<"dealers"> }) {
  const [state, formAction, pending] = useActionState(async (prev: FormState, data: FormData) => {
    const result = await updateStorefrontAction(prev, data);
    if (result.message) toast(result.message);
    return result;
  }, initialState);

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
          className={button("primary", "sm")}
        >
          {pending ? "Saving…" : "Save storefront"}
        </button>
        {state.error && <span className="text-xs text-red">{state.error}</span>}
      </div>
    </form>
  );
}
