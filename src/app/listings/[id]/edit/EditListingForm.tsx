"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import type { Tables } from "@/lib/database.types";
import { updateListingAction, type FormState } from "@/app/actions/garage";
import { ENGINE_TYPES, RIDING_STYLES, TOWNS } from "@/lib/constants/listings";
import { toast } from "@/app/components/Toaster";
import { input as inputClass, label as labelClass, button } from "@/app/components/ui";

const initialState: FormState = { error: null };

export default function EditListingForm({ listing }: { listing: Tables<"listings"> }) {
  const [state, formAction, pending] = useActionState(async (prev: FormState, data: FormData) => {
    const result = await updateListingAction(listing.id, prev, data);
    if (!result.error) toast("Changes saved");
    return result;
  }, initialState);

  // Submitting through onSubmit rather than <form action> on purpose: React
  // resets a form after its action runs, which would wipe what the seller
  // typed whenever validation sends back an error.
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <form onSubmit={submit} className="space-y-3.5">
      {state.error && (
        <p className="rounded-md bg-red/20 px-3 py-2 text-sm text-gold-bright">{state.error}</p>
      )}
      {state.message && (
        <p className="rounded-md bg-panel2 px-3 py-2 text-sm text-gold-bright">{state.message}</p>
      )}

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <label className={labelClass}>
          Make <span className="text-red">*</span>
          <input name="make" required defaultValue={listing.make} className={inputClass} />
        </label>
        <label className={labelClass}>
          Model <span className="text-red">*</span>
          <input name="model" required defaultValue={listing.model} className={inputClass} />
        </label>
        <label className={labelClass}>
          Year
          <input
            name="year"
            type="number"
            min="1900"
            max={new Date().getFullYear() + 1}
            defaultValue={listing.year ?? ""}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Price (€) <span className="text-red">*</span>
          <input
            name="price_eur"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={Number(listing.price_eur)}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Engine size (cc)
          <input name="engine_cc" type="number" min="0" defaultValue={listing.engine_cc ?? ""} className={inputClass} />
        </label>
        <label className={labelClass}>
          Mileage (km)
          <input name="mileage_km" type="number" min="0" defaultValue={listing.mileage_km ?? ""} className={inputClass} />
        </label>
        <label className={labelClass}>
          Engine type
          <select name="engine_type" defaultValue={listing.engine_type ?? ""} className={inputClass}>
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
          <select name="riding_style" defaultValue={listing.riding_style ?? ""} className={inputClass}>
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
          <select name="town" defaultValue={listing.town ?? ""} className={inputClass}>
            <option value="">—</option>
            {TOWNS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={labelClass}>
        Description
        <textarea
          name="description"
          rows={6}
          maxLength={3000}
          defaultValue={listing.description ?? ""}
          className={`${inputClass} normal-case`}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className={button("primary", "lg")}
      >
        {pending ? "Saving…" : listing.status === "rejected" ? "Save and resubmit" : "Save changes"}
      </button>
    </form>
  );
}
