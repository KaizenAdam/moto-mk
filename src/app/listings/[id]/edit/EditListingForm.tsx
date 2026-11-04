"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import type { Tables } from "@/lib/database.types";
import { updateListingAction, type FormState } from "@/app/actions/garage";
import { ENGINE_TYPES, RIDING_STYLES, TOWNS } from "@/lib/constants/listings";
import { toast } from "@/app/components/Toaster";
import { input as inputClass, label as labelClass, button } from "@/app/components/ui";

import { useI18n } from "@/app/components/I18nProvider";

const initialState: FormState = { error: null };

export default function EditListingForm({ listing }: { listing: Tables<"listings"> }) {
  const { t } = useI18n();
  const F = t.bikeForm;
  const [state, formAction, pending] = useActionState(async (prev: FormState, data: FormData) => {
    const result = await updateListingAction(listing.id, prev, data);
    if (!result.error) toast(t.edit.changesSaved);
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
      {state.error && <p className="border-l-4 border-red bg-red/15 px-3 py-2 text-sm text-ink">{state.error}</p>}
      {state.message && <p className=" bg-panel2 px-3 py-2 text-sm text-highlight">{state.message}</p>}

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <label className={labelClass}>
          {F.make} <span className="text-red">*</span>
          <input name="make" required defaultValue={listing.make} className={inputClass} />
        </label>
        <label className={labelClass}>
          {F.model} <span className="text-red">*</span>
          <input name="model" required defaultValue={listing.model} className={inputClass} />
        </label>
        <label className={labelClass}>
          {F.year}
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
          {F.price} <span className="text-red">*</span>
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
          {F.engineSize}
          <input name="engine_cc" type="number" min="0" defaultValue={listing.engine_cc ?? ""} className={inputClass} />
        </label>
        <label className={labelClass}>
          {F.mileage}
          <input
            name="mileage_km"
            type="number"
            min="0"
            defaultValue={listing.mileage_km ?? ""}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          {F.engineType}
          <select name="engine_type" defaultValue={listing.engine_type ?? ""} className={inputClass}>
            <option value="">-</option>
            {ENGINE_TYPES.map((e) => (
              <option key={e.value} value={e.value}>
                {t.engineTypes[e.value] ?? e.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          {F.style}
          <select name="riding_style" defaultValue={listing.riding_style ?? ""} className={inputClass}>
            <option value="">-</option>
            {RIDING_STYLES.map((s) => (
              <option key={s} value={s}>
                {t.styles[s] ?? s}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          {F.town}
          <select name="town" defaultValue={listing.town ?? ""} className={inputClass}>
            <option value="">-</option>
            {TOWNS.map((town) => (
              <option key={town} value={town}>
                {town}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className={labelClass}>
        {F.description}
        <textarea
          name="description"
          rows={6}
          maxLength={3000}
          defaultValue={listing.description ?? ""}
          className={`${inputClass} normal-case`}
        />
      </label>

      <button type="submit" disabled={pending} className={button("primary", "lg")}>
        {pending ? t.common.saving : listing.status === "rejected" ? t.edit.saveResubmit : t.edit.saveChanges}
      </button>
    </form>
  );
}
