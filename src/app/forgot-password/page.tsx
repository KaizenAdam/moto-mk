"use client";

import { useActionState } from "react";
import { AuthShell, HighlightWord } from "@/app/components/Bands";
import Link from "next/link";
import { requestPasswordReset, type AuthState } from "@/app/actions/auth";
import { input as inputClass, label as labelClass, button } from "@/app/components/ui";

const initialState: AuthState = { error: null };

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  return (
    <AuthShell
      line={
        <>
          Lost your
          <br />
          <HighlightWord>keys?</HighlightWord>
        </>
      }
      ticks={["It happens. We'll email you a link to choose a new password."]}
      shard={{
        shape: "bent",
        className: "top-[-30%] left-[40%] h-[160%] w-[320px] -scale-x-100 rotate-[24deg] bg-highlight/[.12]",
      }}
    >
      <form
        action={formAction}
        className="w-full max-w-sm border border-line border-t-4 border-t-highlight bg-panel p-8"
      >
        <h1 className="font-display mb-2 text-4xl">Reset your password</h1>

        {state.message ? (
          <p className="mt-4 text-sm text-ink-dim">{state.message}</p>
        ) : (
          <>
            <p className="mb-6 text-sm text-ink-dim">
              Enter your account email and we&rsquo;ll send you a link to choose a new password.
            </p>

            {state.error && (
              <p className="mb-4 border-l-4 border-red bg-red/15 px-3 py-2 text-sm text-ink">{state.error}</p>
            )}

            <label className={`${labelClass} mb-6`}>
              Email
              <input type="email" name="email" required className={inputClass} />
            </label>

            <button type="submit" disabled={pending} className={`${button("primary", "lg")} w-full`}>
              {pending ? "Sending…" : "Send reset link"}
            </button>
          </>
        )}

        <p className="mt-6 text-center text-sm text-grey">
          <Link href="/login" className="text-highlight hover:underline">
            Back to log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
