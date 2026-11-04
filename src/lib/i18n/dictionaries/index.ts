import type { Locale } from "../config";
import en, { type Dictionary } from "./en";
import mk from "./mk";
import sq from "./sq";

export type { Dictionary };

/**
 * What client components receive (through I18nProvider): everything but the
 * long server-only texts (legal pages, page titles), to keep it out of the
 * browser bundle.
 */
export type ClientDictionary = Omit<Dictionary, "legal" | "meta">;

export const dictionaries: Record<Locale, Dictionary> = { en, mk, sq };

export function clientDictionary(dict: Dictionary): ClientDictionary {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dropping the server-only parts
  const { legal, meta, ...rest } = dict;
  return rest;
}
