"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { ClientDictionary } from "@/lib/i18n/dictionaries";

/**
 * Hands the visitor's language and its strings to client components. The
 * root layout reads the `j5_lang` cookie and wraps the page in this, so a
 * client component calls `useI18n()` where a server one calls `getI18n()`.
 */
const I18nContext = createContext<{ locale: Locale; t: ClientDictionary } | null>(null);

export function I18nProvider({ locale, t, children }: { locale: Locale; t: ClientDictionary; children: ReactNode }) {
  return <I18nContext.Provider value={{ locale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n() needs <I18nProvider> (it's in the root layout)");
  return value;
}
