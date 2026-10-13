"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type AuthState } from "@/app/actions/auth";
import { input as inputClass, label as labelClass, button } from "@/app/components/ui";

const initialState: AuthState = { error: null };


export default function LoginForm({ notice }: { notice?: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <form action={formAction} className="w-full max-w-sm rounded-[10px] border border-line bg-panel p-8">
        <h1 className="font-display mb-6 text-3xl text-gold">Log in</h1>

        {notice && !state.error && (
          <p className="mb-4 rounded-md bg-panel2 px-3 py-2 text-sm text-ink-dim">{notice}</p>
        )}

        {state.error && (
          <p className="mb-4 rounded-md bg-red/20 px-3 py-2 text-sm text-gold-bright">{state.error}</p>
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
          <Link href="/forgot-password" className="text-grey hover:text-gold-bright">
            Forgot password?
          </Link>
        </p>

        <button
          type="submit"
          disabled={pending}
          className={`${button("primary", "lg")} w-full`}
        >
          {pending ? "Logging in…" : "Log in"}
        </button>

        <p className="mt-6 text-center text-sm text-grey">
          No account?{" "}
          <Link href="/signup" className="text-gold-bright hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}
