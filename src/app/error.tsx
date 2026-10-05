"use client";

import { useEffect } from "react";
import Link from "next/link";
import { button } from "@/app/components/ui";

/**
 * Fallback for any page that throws while rendering — most often because
 * Supabase is unreachable (e.g. the free-plan project has paused). Shows a
 * branded "try again" page instead of the platform's raw 500.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-xl px-5 py-16 text-center">
      <span className="mb-4 inline-block rounded-full bg-red px-3 py-1.5 text-[11px] font-bold tracking-wide text-white uppercase">
        Temporarily unavailable
      </span>
      <h1 className="font-display mb-3 text-3xl">We&rsquo;ve hit a pothole</h1>
      <p className="mb-6 text-[15px] text-ink-dim">
        Something went wrong loading this page. It&rsquo;s usually brief — give it a moment and try
        again.
      </p>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className={button("primary", "lg")}
        >
          Try again
        </button>
        <Link
          href="/"
          className={button("outline", "lg")}
        >
          Home
        </Link>
      </div>
    </main>
  );
}
