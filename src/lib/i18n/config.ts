/**
 * The site's languages. English is the original; Macedonian and Albanian
 * (North Macedonia's two official languages) are translations. The
 * visitor's choice lives in the `j5_lang` cookie, set by the cookies &
 * language bar and the header switch; pages keep the same URLs.
 */
export const LOCALES = ["en", "mk", "sq"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "j5_lang";

/** BCP 47 tags, for <html lang>, Intl number/date formatting and plurals. */
export const LOCALE_TAGS: Record<Locale, string> = { en: "en-GB", mk: "mk-MK", sq: "sq-AL" };

/** Each language's name in itself, for the switchers. */
export const LOCALE_NAMES: Record<Locale, string> = { en: "English", mk: "Македонски", sq: "Shqip" };
export const LOCALE_SHORT: Record<Locale, string> = { en: "EN", mk: "MK", sq: "SQ" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
