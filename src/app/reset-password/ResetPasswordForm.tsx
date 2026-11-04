"use client";

import { useActionState } from "react";
import { updatePassword, type AuthState } from "@/app/actions/auth";
import { input as inputClass, label as labelClass, button } from "@/app/components/ui";
import { useI18n } from "@/app/components/I18nProvider";

const initialState: AuthState = { error: null };

export default function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);
  const { t } = useI18n();
  const A = t.auth;

  return (
    <form action={formAction} className="w-full max-w-sm border border-line border-t-4 border-t-highlight bg-panel p-8">
      <h1 className="font-display mb-6 text-4xl">{A.chooseNew}</h1>

      {state.error && <p className="mb-4 border-l-4 border-red bg-red/15 px-3 py-2 text-sm text-ink">{state.error}</p>}

      <label className={`${labelClass} mb-4`}>
        {A.newPassword} <span className="normal-case font-normal text-grey">{A.passwordHint}</span>
        <input type="password" name="password" required minLength={8} className={inputClass} />
      </label>

      <label className={`${labelClass} mb-6`}>
        {A.confirmPassword}
        <input type="password" name="confirm" required minLength={8} className={inputClass} />
      </label>

      <button type="submit" disabled={pending} className={`${button("primary", "lg")} w-full`}>
        {pending ? t.common.saving : A.saveNew}
      </button>
    </form>
  );
}
