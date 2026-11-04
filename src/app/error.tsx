"use client";

import { useEffect } from "react";
import Link from "next/link";
import { button } from "@/app/components/ui";
import Badge from "@/app/components/Badge";
import { useI18n } from "@/app/components/I18nProvider";

/**
 * Fallback for any page that throws while rendering — most often because
 * Supabase is unreachable (e.g. the free-plan project has paused). Shows a
 * branded "try again" page instead of the platform's raw 500.
 */
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { t } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-xl px-5 py-16 text-center">
      <Badge tone="red" size="md" className="mb-4">
        {t.error.badge}
      </Badge>
      <h1 className="font-display mb-3 text-3xl">{t.error.heading}</h1>
      <p className="mb-6 text-[15px] text-ink-dim">{t.error.body}</p>
      <div className="flex justify-center gap-3">
        <button type="button" onClick={() => retry()} className={button("primary", "lg")}>
          {t.error.retry}
        </button>
        <Link href="/" className={button("outline", "lg")}>
          {t.common.home}
        </Link>
      </div>
    </main>
  );
}
