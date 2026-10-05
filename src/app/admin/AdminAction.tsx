"use client";

import { useActionState } from "react";
import type { AdminActionState } from "@/app/actions/admin";
import { toast } from "@/app/components/Toaster";
import { button } from "@/app/components/ui";

const initialState: AdminActionState = { error: null, done: false };

const tones = { approve: "success", reject: "danger" } as const;


/**
 * One admin button (approve / reject / delete) with its own pending and
 * error state. `withReason` adds a short optional text field, sent as
 * `reason` — used for rejecting a listing so the seller learns why.
 */
export default function AdminAction({
  action,
  label,
  tone,
  withReason = false,
}: {
  action: (prev: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  label: string;
  tone: keyof typeof tones;
  withReason?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    async (prev: AdminActionState, formData: FormData) => {
      const result = await action(prev, formData);
      if (result.done) toast(`${label} — done`);
      return result;
    },
    initialState
  );

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      {withReason && (
        <input
          name="reason"
          placeholder="Reason (shown to the seller)"
          maxLength={300}
          className="w-56 rounded-md border border-line bg-panel2 px-3 py-1.5 text-xs text-ink outline-none focus:border-gold"
        />
      )}
      <button
        type="submit"
        disabled={pending}
        className={button(tones[tone], "sm")}
      >
        {pending ? "Working…" : label}
      </button>
      {state.error && <span className="text-xs text-red">{state.error}</span>}
    </form>
  );
}
