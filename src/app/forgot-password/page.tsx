"use client";

import { useActionState } from "react";
import { AuthShell, HighlightWord } from "@/app/components/Bands";
import Link from "next/link";
import { requestPasswordReset, type AuthState } from "@/app/actions/auth";
import { input as inputClass, label as labelClass, button } from "@/app/components/ui";
import { useI18n } from "@/app/components/I18nProvider";

const initialState: AuthState = { error: null };

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);
  const { t } = useI18n();
  const A = t.auth;

  return (
    <AuthShell
      line={
        <>
          {A.forgotLine1}
          <br />
          <HighlightWord>{A.forgotLine2}</HighlightWord>
        </>
      }
      ticks={A.forgotTicks}
      shard={{
        shape: "bent",
        className: "top-[-30%] left-[40%] h-[160%] w-[320px] -scale-x-100 rotate-[24deg] bg-highlight/[.12]",
      }}
    >
      <form
        action={formAction}
        className="w-full max-w-sm border border-line border-t-4 border-t-highlight bg-panel p-8"
      >
        <h1 className="font-display mb-2 text-4xl">{A.resetTitle}</h1>

        {state.message ? (
          <p className="mt-4 text-sm text-ink-dim">{state.message}</p>
        ) : (
          <>
            <p className="mb-6 text-sm text-ink-dim">{A.resetIntro}</p>

            {state.error && (
              <p className="mb-4 border-l-4 border-red bg-red/15 px-3 py-2 text-sm text-ink">{state.error}</p>
            )}

            <label className={`${labelClass} mb-6`}>
              {A.email}
              <input type="email" name="email" required className={inputClass} />
            </label>

            <button type="submit" disabled={pending} className={`${button("primary", "lg")} w-full`}>
              {pending ? A.sending : A.sendLink}
            </button>
          </>
        )}

        <p className="mt-6 text-center text-sm text-grey">
          <Link href="/login" className="text-highlight hover:underline">
            {A.backToLogin}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
