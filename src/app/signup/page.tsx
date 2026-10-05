"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthState } from "@/app/actions/auth";
import { input as inputClass, label as labelClass, button } from "@/app/components/ui";

const initialState: AuthState = { error: null };


export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  if (state.message) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm rounded-[10px] border border-line bg-panel p-8 text-center">
          <h1 className="font-display mb-3 text-2xl text-gold">Check your email</h1>
          <p className="text-sm text-ink-dim">{state.message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <form action={formAction} className="w-full max-w-sm rounded-[10px] border border-line bg-panel p-8">
        <h1 className="font-display mb-6 text-2xl text-gold">Sign up</h1>

        {state.error && (
          <p className="mb-4 rounded-md bg-red/20 px-3 py-2 text-sm text-gold-bright">{state.error}</p>
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

        <button
          type="submit"
          disabled={pending}
          className={`${button("primary", "lg")} w-full`}
        >
          {pending ? "Creating account…" : "Sign up"}
        </button>

        <p className="mt-6 text-center text-sm text-grey">
          Already have an account?{" "}
          <Link href="/login" className="text-gold-bright hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}
