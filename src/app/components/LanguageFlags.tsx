"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, LOCALE_FLAGS, LOCALE_NAMES, type Locale } from "@/lib/i18n/config";
import { saveLocale } from "@/lib/i18n/client";
import { useI18n } from "./I18nProvider";

/**
 * The language picker: one flag per language. Picking one switches the
 * site at once (saves the `j5_lang` cookie, then re-renders the page in it;
 * the URL stays the same). Lives in the cookies bar (`labelled`: flag and
 * the language's own name) and the footer (flags only).
 */
export default function LanguageFlags({ labelled = false }: { labelled?: boolean }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: Locale) {
    if (next === locale || pending) return;
    saveLocale(next);
    startTransition(() => router.refresh());
  }

  return (
    <div
      role="group"
      aria-label={t.lang.switchTo}
      className={`${labelled ? "grid grid-cols-3 gap-2 sm:flex" : "flex gap-2"} ${pending ? "opacity-60" : ""}`}
    >
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            lang={l}
            onClick={() => choose(l)}
            aria-pressed={active}
            aria-label={LOCALE_NAMES[l]}
            title={LOCALE_NAMES[l]}
            className={`flex items-center border-2 transition ${
              labelled ? "flex-col gap-1 px-2 py-2 sm:flex-row sm:gap-2 sm:px-2.5 sm:py-1.5" : "p-1"
            } ${active ? "border-highlight bg-highlight/10" : "border-line hover:border-highlight"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- tiny static SVG */}
            <img
              src={LOCALE_FLAGS[l]}
              alt=""
              width={labelled ? 28 : 24}
              height={labelled ? 21 : 18}
              className={`block shrink-0 ${labelled ? "h-[21px] w-7" : "h-[18px] w-6"} ${active ? "" : "opacity-80"}`}
            />
            {labelled && (
              <span
                className={`font-display text-xs tracking-[.04em] sm:text-sm ${active ? "text-highlight" : "text-ink"}`}
              >
                {LOCALE_NAMES[l]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
