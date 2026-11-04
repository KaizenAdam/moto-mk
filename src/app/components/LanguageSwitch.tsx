"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, LOCALE_NAMES, LOCALE_SHORT, type Locale } from "@/lib/i18n/config";
import { saveLocale } from "@/lib/i18n/client";
import { useI18n } from "./I18nProvider";

/**
 * EN · MK · SQ in the header (and the phone menu). Saves the choice in the
 * `j5_lang` cookie and re-renders the page in it; the URL stays the same.
 */
export default function LanguageSwitch({ size = "sm", onSwitch }: { size?: "sm" | "lg"; onSwitch?: () => void }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: Locale) {
    if (next === locale) return;
    saveLocale(next);
    onSwitch?.();
    startTransition(() => router.refresh());
  }

  return (
    <div role="group" aria-label={t.lang.switchTo} className={`flex ${pending ? "opacity-60" : ""}`}>
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            lang={l}
            onClick={() => choose(l)}
            aria-pressed={active}
            title={LOCALE_NAMES[l]}
            className={`font-display -ml-px border first:ml-0 ${
              size === "lg" ? "flex-1 px-4 py-2.5 text-base" : "px-2 py-1 text-xs"
            } tracking-[.06em] transition ${
              active
                ? "relative z-10 border-highlight bg-highlight text-[#111]"
                : "border-line text-[#9a988f] hover:border-highlight hover:text-white"
            }`}
          >
            {size === "lg" ? LOCALE_NAMES[l] : LOCALE_SHORT[l]}
          </button>
        );
      })}
    </div>
  );
}
