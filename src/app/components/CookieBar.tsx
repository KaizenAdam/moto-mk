"use client";

import { useSyncExternalStore } from "react";
import { button } from "./ui";
import { useI18n } from "./I18nProvider";
import LanguageFlags from "./LanguageFlags";
import { saveLocale, setCookie } from "@/lib/i18n/client";

/**
 * The bar at the bottom of the screen on a first visit: what cookies the
 * site uses, and which language the visitor would like. Picking a flag
 * switches the site straight away (`j5_lang`); OK saves `j5_consent` and
 * closes the bar. Both cookies are first-party and last a year.
 *
 * The site only sets essential cookies (the Supabase sign-in session and
 * these two), so there's nothing to opt out of. If analytics or ad cookies
 * are ever added, this needs a real "Reject" choice before they load.
 */
const CONSENT = "j5_consent";
const REOPEN = "j5-cookie-settings";

function hasConsent() {
  return document.cookie.split("; ").some((c) => c.startsWith(`${CONSENT}=`));
}

// The bar's visibility is derived from document.cookie, so it's read through
// useSyncExternalStore: hidden on the server and during hydration, then
// shown straight after if no choice has been saved.
function subscribe(onChange: () => void) {
  window.addEventListener(REOPEN, onChange);
  return () => window.removeEventListener(REOPEN, onChange);
}
let reopened = false;
const needsChoice = () => reopened || !hasConsent();

/** Opens the bar again (the footer's "Cookies" link). */
export function openCookieSettings() {
  reopened = true;
  window.dispatchEvent(new Event(REOPEN));
}

export default function CookieBar() {
  const { locale, t } = useI18n();
  const open = useSyncExternalStore(subscribe, needsChoice, () => false);

  if (!open) return null;

  function save() {
    setCookie(CONSENT, "essential");
    saveLocale(locale);
    reopened = false;
    window.dispatchEvent(new Event(REOPEN));
  }

  return (
    <section
      aria-label={t.cookies.region}
      className="fixed inset-x-0 bottom-0 z-[90] border-t-4 border-red bg-[#0b0b0d] shadow-[0_-12px_40px_rgba(0,0,0,.6)]"
    >
      <div className="mx-auto grid max-w-[1280px] gap-4 px-5 py-4 sm:py-5 lg:grid-cols-[1fr_auto_auto] lg:items-center lg:gap-8">
        <div>
          <p className="font-display text-lg font-semibold">{t.cookies.title}</p>
          <p className="mt-1 max-w-xl text-sm text-ink-dim">{t.cookies.body}</p>
        </div>

        <div>
          <p className="font-display mb-1.5 text-xs tracking-[.08em] text-grey">{t.cookies.preferred}</p>
          <LanguageFlags labelled />
        </div>

        <button type="button" onClick={save} className={`${button("primary", "md")} lg:self-center`}>
          {t.cookies.ok}
        </button>
      </div>
    </section>
  );
}
