"use client";

import { useActionState } from "react";
import { updatePassword, type AuthState } from "@/app/actions/auth";
import { input as inputClass, label as labelClass, button } from "@/app/components/ui";

const initialState: AuthState = { error: null };


export default function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <form action={formAction} className="w-full max-w-sm rounded-[10px] border border-line bg-panel p-8">
      <h1 className="font-display mb-6 text-3xl text-gold">Choose a new password</h1>

      {state.error && (
        <p className="mb-4 rounded-md bg-red/20 px-3 py-2 text-sm text-gold-bright">{state.error}</p>
      )}

      <label className={`${labelClass} mb-4`}>
        New password <span className="normal-case font-normal text-grey">(8+ characters)</span>
        <input type="password" name="password" required minLength={8} className={inputClass} />
      </label>

      <label className={`${labelClass} mb-6`}>
        Confirm new password
        <input type="password" name="confirm" required minLength={8} className={inputClass} />
      </label>

      <button
        type="submit"
        disabled={pending}
        className={`${button("primary", "lg")} w-full`}
      >
        {pending ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
