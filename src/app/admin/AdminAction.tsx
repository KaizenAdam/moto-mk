"use client";

import { useActionState } from "react";
import type { AdminActionState } from "@/app/actions/admin";

const initialState: AdminActionState = { error: null, done: false };

const tones = {
  approve: "bg-green-700 hover:bg-green-600",
  reject: "bg-red-900 hover:bg-red-800",
};

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
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      {withReason && (
        <input
          name="reason"
          placeholder="Reason (shown to the seller)"
          maxLength={300}
          className="w-56 rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-white outline-none focus:border-amber-400"
        />
      )}
      <button
        type="submit"
        disabled={pending}
        className={`rounded px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60 ${tones[tone]}`}
      >
        {pending ? "Working…" : label}
      </button>
      {state.error && <span className="text-xs text-red-400">{state.error}</span>}
    </form>
  );
}
