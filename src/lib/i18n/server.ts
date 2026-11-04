import { cache } from "react";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { dictionaries, type Dictionary } from "./dictionaries";

/**
 * The visitor's language, from the `j5_lang` cookie (English if unset).
 * Server Components, metadata and Server Actions call these; client
 * components get the same thing from `useI18n()`.
 */
export const getLocale = cache(async (): Promise<Locale> => {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
});

export const getDictionary = cache(async (): Promise<Dictionary> => dictionaries[await getLocale()]);

/** Both at once, the usual need in a page. */
export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}
