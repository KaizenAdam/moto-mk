"use client";

import { useActionState } from "react";
import { updateProfileAction, type FormState } from "@/app/actions/garage";
import { TOWNS } from "@/lib/constants/listings";
import { toast } from "@/app/components/Toaster";
import { input as inputClass, label as labelClass, button } from "@/app/components/ui";

const initialState: FormState = { error: null };

export default function ProfileForm({
  name,
  phone,
  town,
}: {
  name: string | null;
  phone: string | null;
  town: string | null;
}) {
  const [state, formAction, pending] = useActionState(async (prev: FormState, data: FormData) => {
    const result = await updateProfileAction(prev, data);
    if (result.message) toast(result.message);
    return result;
  }, initialState);

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
          className={button("primary", "sm")}
        >
          {pending ? "Saving…" : "Save profile"}
        </button>
        {state.error && <span className="text-xs text-red">{state.error}</span>}
      </div>
    </form>
  );
}
