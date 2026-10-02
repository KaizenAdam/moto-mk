"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/actions/garage";

const initialState: FormState = { error: null };

const tones = {
  primary:
    "bg-gradient-to-br from-gold-bright to-gold text-[#141414] hover:brightness-110",
  outline: "border border-line text-ink hover:border-gold",
  danger: "border border-red/60 text-red hover:bg-red hover:text-white",
};

/**
 * A single-click seller action (mark sold, delete, remove photo) with its
 * own pending and error state. `confirm` asks first, for anything that
 * can't be undone.
 */
export default function ActionButton({
  action,
  label,
  tone = "outline",
  confirm,
}: {
  action: () => Promise<FormState>;
  label: string;
  tone?: keyof typeof tones;
  confirm?: string;
}) {
  const [state, formAction, pending] = useActionState(() => action(), initialState);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      className="inline-flex items-center gap-2"
    >
      <button
        type="submit"
        disabled={pending}
        className={`rounded-md px-3 py-1.5 text-xs font-bold tracking-wide uppercase transition disabled:opacity-60 ${tones[tone]}`}
      >
        {pending ? "…" : label}
      </button>
      {state.error && <span className="text-xs text-red">{state.error}</span>}
    </form>
  );
}
