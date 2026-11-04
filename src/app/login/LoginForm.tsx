"use client";

import { useActionState } from "react";
import { AuthShell, HighlightWord } from "@/app/components/Bands";
import Link from "next/link";
import { signIn, type AuthState } from "@/app/actions/auth";
import { input as inputClass, label as labelClass, button } from "@/app/components/ui";

const initialState: AuthState = { error: null };

export default function LoginForm({ notice }: { notice?: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <AuthShell
      line={
        <>
          Welcome
          <br />
          <HighlightWord>back</HighlightWord>
        </>
      }
      ticks={["Your listings and saved bikes", "Call or WhatsApp sellers"]}
      shard={{ shape: "bent", className: "top-[-20%] right-[6%] h-[140%] w-[420px] -rotate-[10deg] bg-red/[.22]" }}
    >
      <form
        action={formAction}
        className="w-full max-w-sm border border-line border-t-4 border-t-highlight bg-panel p-8"
      >
        <h1 className="font-display mb-6 text-4xl">Log in</h1>

        {notice && !state.error && <p className="mb-4 bg-panel2 px-3 py-2 text-sm text-ink-dim">{notice}</p>}

        {state.error && (
          <p className="mb-4 border-l-4 border-red bg-red/15 px-3 py-2 text-sm text-ink">{state.error}</p>
        )}

        <label className={`${labelClass} mb-4`}>
          Email
          <input type="email" name="email" required className={inputClass} />
        </label>

        <label className={`${labelClass} mb-2`}>
          Password
          <input type="password" name="password" required className={inputClass} />
        </label>

        <p className="mb-6 text-right text-xs">
          <Link href="/forgot-password" className="text-grey hover:text-highlight">
            Forgot password?
          </Link>
        </p>

        <button type="submit" disabled={pending} className={`${button("primary", "lg")} w-full`}>
          {pending ? "Logging in…" : "Log in"}
        </button>

        <p className="mt-6 text-center text-sm text-grey">
          No account?{" "}
          <Link href="/signup" className="text-highlight hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
