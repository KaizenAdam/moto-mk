import { LOCALE_COOKIE, type Locale } from "./config";

const YEAR = 60 * 60 * 24 * 365;

/** Saves a first-party cookie for a year (browser only). */
export function setCookie(name: string, value: string) {
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${name}=${value}; path=/; max-age=${YEAR}; samesite=lax${secure}`;
}

/** Saves the language; the caller then refreshes so server components re-render in it. */
export function saveLocale(locale: Locale) {
  setCookie(LOCALE_COOKIE, locale);
}
