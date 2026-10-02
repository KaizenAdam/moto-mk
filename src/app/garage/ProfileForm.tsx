"use client";

import { useActionState } from "react";
import { updateProfileAction, type FormState } from "@/app/actions/garage";
import { TOWNS } from "@/lib/constants/listings";

const initialState: FormState = { error: null };
const inputClass =
  "mt-1 w-full rounded-md border border-line bg-panel2 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold";
const labelClass = "block text-xs font-bold tracking-wide text-ink-dim uppercase";

export default function ProfileForm({
  name,
  phone,
  town,
}: {
  name: string | null;
  phone: string | null;
  town: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-3.5">
      <label className={labelClass}>
        Name
        <input name="name" defaultValue={name ?? ""} className={inputClass} />
      </label>
      <label className={labelClass}>
        Phone (WhatsApp)
        <input name="phone" type="tel" defaultValue={phone ?? ""} placeholder="070 123 456" className={inputClass} />
      </label>
      <label className={labelClass}>
        Town
        <select name="town" defaultValue={town ?? ""} className={inputClass}>
          <option value="">—</option>
          {TOWNS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gradient-to-br from-gold-bright to-gold px-4 py-2 text-xs font-bold tracking-wide text-[#141414] uppercase disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save profile"}
        </button>
        {state.error && <span className="text-xs text-red">{state.error}</span>}
        {state.message && <span className="text-xs text-gold-bright">{state.message}</span>}
      </div>
    </form>
  );
}
