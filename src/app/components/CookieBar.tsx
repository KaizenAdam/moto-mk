"use client";

import { useState, useSyncExternalStore } from "react";
import { button } from "./ui";

/**
 * The bar at the bottom of the screen on a first visit: what cookies the
 * site uses, and which language the visitor would like. Choosing saves two
 * first-party cookies (`j5_consent`, `j5_lang`) for a year.
 *
 * The site only sets essential cookies (the Supabase sign-in session and
 * these two), so there's nothing to opt out of. If analytics or ad cookies
 * are ever added, this needs a real "Reject" choice before they load.
 *
 * Only English exists so far (real translations are separate work, see
 * CLAUDE.md), so picking Macedonian or Albanian is remembered and says so
 * honestly, rather than pretending to switch.
 */
const CONSENT = "j5_consent";
const LANG = "j5_lang";
const REOPEN = "j5-cookie-settings";
const YEAR = 60 * 60 * 24 * 365;

export const LANGUAGES = [
  { id: "en", label: "English", soon: false },
  { id: "mk", label: "Македонски", soon: true },
  { id: "sq", label: "Shqip", soon: true },
] as const;
type LangId = (typeof LANGUAGES)[number]["id"];

function readCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

// The bar's visibility is derived from document.cookie, so it's read through
// useSyncExternalStore: hidden on the server and during hydration, then
// shown straight after if no choice has been saved.
function subscribe(onChange: () => void) {
  window.addEventListener(REOPEN, onChange);
  return () => window.removeEventListener(REOPEN, onChange);
}
let reopened = false;
const needsChoice = () => reopened || !readCookie(CONSENT);

/** Opens the bar again (the footer's "Cookies & language" link). */
export function openCookieSettings() {
  reopened = true;
  window.dispatchEvent(new Event(REOPEN));
}

export default function CookieBar() {
  const open = useSyncExternalStore(subscribe, needsChoice, () => false);
  const [lang, setLang] = useState<LangId | null>(null);
  const chosen = lang ?? ((open && (readCookie(LANG) as LangId | undefined)) || "en");
  const choice = LANGUAGES.find((l) => l.id === chosen) ?? LANGUAGES[0];

  if (!open) return null;

  function save() {
    const attrs = `; path=/; max-age=${YEAR}; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
    document.cookie = `${CONSENT}=essential${attrs}`;
    document.cookie = `${LANG}=${chosen}${attrs}`;
    reopened = false;
    window.dispatchEvent(new Event(REOPEN));
  }

  return (
    <section
      aria-label="Cookies and language"
      className="fixed inset-x-0 bottom-0 z-[90] border-t-4 border-red bg-[#0b0b0d] shadow-[0_-12px_40px_rgba(0,0,0,.6)]"
    >
      <div className="mx-auto grid max-w-[1280px] gap-4 px-5 py-4 sm:py-5 lg:grid-cols-[1fr_auto_auto] lg:items-center lg:gap-8">
        <div>
          <p className="font-display text-lg font-semibold">Cookies &amp; language</p>
          <p className="mt-1 max-w-xl text-sm text-ink-dim">
            We only use essential cookies: they keep you signed in and remember the choices you make here. No tracking,
            no advertising cookies.
          </p>
        </div>

        <div>
          <p id="lang-label" className="font-display mb-1.5 text-xs tracking-[.08em] text-grey">
            Preferred language
          </p>
          <div role="radiogroup" aria-labelledby="lang-label" className="flex">
            {LANGUAGES.map((l) => {
              const active = l.id === chosen;
              return (
                <button
                  key={l.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setLang(l.id)}
                  className={`font-display -ml-px border-2 px-3.5 py-2 text-sm first:ml-0 transition ${
                    active
                      ? "relative z-10 border-highlight bg-highlight text-[#111]"
                      : "border-line text-ink hover:border-highlight"
                  }`}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
          {choice.soon && (
            <p className="mt-1.5 text-xs text-highlight">
              {choice.label} is coming soon. We&rsquo;ll remember your choice; the site is in English for now.
            </p>
          )}
        </div>

        <button type="button" onClick={save} className={`${button("primary", "md")} lg:self-center`}>
          OK, got it
        </button>
      </div>
    </section>
  );
}
