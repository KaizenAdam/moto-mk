"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/actions/garage";
import { toast } from "./Toaster";
import { button } from "./ui";

const initialState: FormState = { error: null };


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
  successMessage,
}: {
  action: () => Promise<FormState>;
  label: string;
  tone?: "primary" | "outline" | "danger";
  confirm?: string;
  /** Shown as a toast when the action succeeds. */
  successMessage?: string;
}) {
  const [state, formAction, pending] = useActionState(async () => {
    const result = await action();
    if (!result.error && successMessage) toast(successMessage);
    return result;
  }, initialState);

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
        className={button(tone, "sm")}
      >
        {pending ? "…" : label}
      </button>
      {state.error && <span className="text-xs text-red">{state.error}</span>}
    </form>
  );
}
