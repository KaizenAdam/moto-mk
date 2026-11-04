"use client";

import { useActionState } from "react";
import { AuthShell, HighlightWord } from "@/app/components/Bands";
import Link from "next/link";
import { signUp, type AuthState } from "@/app/actions/auth";
import { input as inputClass, label as labelClass, button } from "@/app/components/ui";

const initialState: AuthState = { error: null };

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  if (state.message) {
    return (
      <AuthShell
        line={
          <>
            Join the
            <br />
            <HighlightWord>ride</HighlightWord>
          </>
        }
        ticks={["Free to list your bike", "Save the bikes you like", "Call or WhatsApp sellers"]}
        shard={{
          shape: "double",
          className: "bottom-[-30%] right-[-140px] h-[140%] w-[560px] rotate-[10deg] bg-highlight/[.10]",
        }}
      >
        <div className="w-full max-w-sm border border-line border-t-4 border-t-highlight bg-panel p-8 text-center">
          <h1 className="font-display mb-3 text-4xl">Check your email</h1>
          <p className="text-sm text-ink-dim">{state.message}</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      line={
        <>
          Join the
          <br />
          <HighlightWord>ride</HighlightWord>
        </>
      }
      ticks={["Free to list your bike", "Save the bikes you like", "Call or WhatsApp sellers"]}
      shard={{
        shape: "double",
        className: "bottom-[-30%] right-[-140px] h-[140%] w-[560px] rotate-[10deg] bg-highlight/[.10]",
      }}
    >
      <form
        action={formAction}
        className="w-full max-w-sm border border-line border-t-4 border-t-highlight bg-panel p-8"
      >
        <h1 className="font-display mb-6 text-4xl">Sign up</h1>

        {state.error && (
          <p className="mb-4 border-l-4 border-red bg-red/15 px-3 py-2 text-sm text-ink">{state.error}</p>
        )}

        <label className={`${labelClass} mb-4`}>
          Name
          <input type="text" name="name" required className={inputClass} />
        </label>

        <label className={`${labelClass} mb-4`}>
          Email
          <input type="email" name="email" required className={inputClass} />
        </label>

        <label className={`${labelClass} mb-6`}>
          Password <span className="normal-case font-normal text-grey">(8+ characters)</span>
          <input type="password" name="password" required minLength={8} className={inputClass} />
        </label>

        <button type="submit" disabled={pending} className={`${button("primary", "lg")} w-full`}>
          {pending ? "Creating account…" : "Sign up"}
        </button>

        <p className="mt-3 text-center text-xs text-grey">
          By signing up you agree to our{" "}
          <Link href="/terms" className="text-highlight hover:underline">
            terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-highlight hover:underline">
            privacy policy
          </Link>
          .
        </p>

        <p className="mt-6 text-center text-sm text-grey">
          Already have an account?{" "}
          <Link href="/login" className="text-highlight hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
