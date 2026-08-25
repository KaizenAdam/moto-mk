"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthState } from "@/app/actions/auth";

const initialState: AuthState = { error: null };

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <main className="min-h-screen flex items-center justify-center bg-black px-4">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-950 p-8"
      >
        <h1 className="mb-6 text-2xl font-bold text-amber-400">Sign up</h1>

        {state.error && (
          <p className="mb-4 rounded bg-red-950 px-3 py-2 text-sm text-red-400">
            {state.error}
          </p>
        )}

        <label className="mb-4 block text-sm text-zinc-300">
          Name
          <input
            type="text"
            name="name"
            required
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-amber-400"
          />
        </label>

        <label className="mb-4 block text-sm text-zinc-300">
          Email
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-amber-400"
          />
        </label>

        <label className="mb-6 block text-sm text-zinc-300">
          Password
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-amber-400"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-amber-400 px-4 py-2 font-semibold text-black transition hover:bg-amber-300 disabled:opacity-60"
        >
          {pending ? "Creating account…" : "Sign up"}
        </button>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="text-amber-400 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}
