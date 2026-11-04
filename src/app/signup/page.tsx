"use client";

import { useActionState } from "react";
import { AuthShell, HighlightWord } from "@/app/components/Bands";
import Link from "next/link";
import { signUp, type AuthState } from "@/app/actions/auth";
import { input as inputClass, label as labelClass, button } from "@/app/components/ui";
import { useI18n } from "@/app/components/I18nProvider";

const initialState: AuthState = { error: null };

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, initialState);
  const { t } = useI18n();
  const A = t.auth;

  if (state.message) {
    return (
      <AuthShell
        line={
          <>
            {A.signupLine1}
            <br />
            <HighlightWord>{A.signupLine2}</HighlightWord>
          </>
        }
        ticks={A.signupTicks}
        shard={{
          shape: "double",
          className: "bottom-[-30%] right-[-140px] h-[140%] w-[560px] rotate-[10deg] bg-highlight/[.10]",
        }}
      >
        <div className="w-full max-w-sm border border-line border-t-4 border-t-highlight bg-panel p-8 text-center">
          <h1 className="font-display mb-3 text-4xl">{A.checkEmail}</h1>
          <p className="text-sm text-ink-dim">{state.message}</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      line={
        <>
          {A.signupLine1}
          <br />
          <HighlightWord>{A.signupLine2}</HighlightWord>
        </>
      }
      ticks={A.signupTicks}
      shard={{
        shape: "double",
        className: "bottom-[-30%] right-[-140px] h-[140%] w-[560px] rotate-[10deg] bg-highlight/[.10]",
      }}
    >
      <form
        action={formAction}
        className="w-full max-w-sm border border-line border-t-4 border-t-highlight bg-panel p-8"
      >
        <h1 className="font-display mb-6 text-4xl">{t.common.signUp}</h1>

        {state.error && (
          <p className="mb-4 border-l-4 border-red bg-red/15 px-3 py-2 text-sm text-ink">{state.error}</p>
        )}

        <label className={`${labelClass} mb-4`}>
          {A.name}
          <input type="text" name="name" required className={inputClass} />
        </label>

        <label className={`${labelClass} mb-4`}>
          {A.email}
          <input type="email" name="email" required className={inputClass} />
        </label>

        <label className={`${labelClass} mb-6`}>
          {A.password} <span className="normal-case font-normal text-grey">{A.passwordHint}</span>
          <input type="password" name="password" required minLength={8} className={inputClass} />
        </label>

        <button type="submit" disabled={pending} className={`${button("primary", "lg")} w-full`}>
          {pending ? A.creating : t.common.signUp}
        </button>

        <p className="mt-3 text-center text-xs text-grey">
          {A.agree.split(/(\{terms\}|\{privacy\})/).map((part, i) =>
            part === "{terms}" ? (
              <Link key={i} href="/terms" className="text-highlight hover:underline">
                {A.termsLink}
              </Link>
            ) : part === "{privacy}" ? (
              <Link key={i} href="/privacy" className="text-highlight hover:underline">
                {A.privacyLink}
              </Link>
            ) : (
              part
            ),
          )}
        </p>

        <p className="mt-6 text-center text-sm text-grey">
          {A.haveAccount}{" "}
          <Link href="/login" className="text-highlight hover:underline">
            {t.common.logIn}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
