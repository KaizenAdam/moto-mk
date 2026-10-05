"use client";

import { useActionState } from "react";
import { requestDealerAction, type FormState } from "@/app/actions/garage";
import { input as inputClass, label as labelClass, button } from "@/app/components/ui";

const initialState: FormState = { error: null };

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
          className={button("outline", "sm")}
        >
          {pending ? "Sending…" : "Request dealer account"}
        </button>
        {state.error && <span className="text-xs text-red">{state.error}</span>}
      </div>
    </form>
  );
}
