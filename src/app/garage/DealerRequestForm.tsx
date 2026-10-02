"use client";

import { useActionState } from "react";
import { requestDealerAction, type FormState } from "@/app/actions/garage";

const initialState: FormState = { error: null };
const inputClass =
  "mt-1 w-full rounded-md border border-line bg-panel2 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold";
const labelClass = "block text-xs font-bold tracking-wide text-ink-dim uppercase";

export default function DealerRequestForm() {
  const [state, formAction, pending] = useActionState(requestDealerAction, initialState);

  if (state.message) return <p className="text-sm text-gold-bright">{state.message}</p>;

  return (
    <form action={formAction} className="space-y-3.5">
      <label className={labelClass}>
        Business name <span className="text-red">*</span>
        <input name="business_name" required className={inputClass} />
      </label>
      <label className={labelClass}>
        Address
        <input name="address" className={inputClass} />
      </label>
      <label className={labelClass}>
        Business phone (shown on your storefront)
        <input name="phone" type="tel" className={inputClass} />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-line px-4 py-2 text-xs font-bold tracking-wide text-ink uppercase hover:border-gold disabled:opacity-60"
        >
          {pending ? "Sending…" : "Request dealer account"}
        </button>
        {state.error && <span className="text-xs text-red">{state.error}</span>}
      </div>
    </form>
  );
}
