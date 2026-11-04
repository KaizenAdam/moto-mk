import { formatNumber } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/config";

// Free-text convention shared by the sell form and browse filters — riding_style
// has no DB check constraint, so this list is an app-level convention, not schema.
export const RIDING_STYLES = ["Sport", "Enduro", "Cruiser", "Scooter", "Naked", "Touring"] as const;

// Must match the listings.engine_type check constraint exactly.
export const ENGINE_TYPES = [
  { value: "2-stroke", label: "2-stroke" },
  { value: "4-stroke", label: "4-stroke" },
  { value: "electric", label: "Electric" },
] as const;

// Towns offered when listing a bike. Free text in the schema; this is the
// app's list, shared by the sell and edit forms.
export const TOWNS = ["Skopje", "Ohrid", "Bitola", "Kumanovo", "Tetovo", "Struga"] as const;

// engine_cc is a plain integer column — these are "up to" thresholds, not buckets.
export const CC_THRESHOLDS = [125, 400, 650, 1000] as const;

export const PRICE_THRESHOLDS_EUR = [2000, 4000, 6000, 9000, 12000] as const;

export const EUR_TO_MKD = 61.5;

export type Currency = "EUR" | "MKD";

/**
 * "€6,400" / "≈ 393,600 MKD". Grouped by our own formatter, not the
 * browser's locale, so the server and every browser print the same thing
 * (a mismatch breaks hydration). Pass the page's language for its digit
 * grouping (6.400 in Macedonian).
 */
export function formatPrice(eur: number, currency: Currency, locale: Locale = "en") {
  const mkd = formatNumber(locale, Math.round(eur * EUR_TO_MKD));
  if (currency === "MKD") {
    return { main: `${mkd} MKD`, alt: `≈ €${formatNumber(locale, eur)}` };
  }
  return { main: `€${formatNumber(locale, eur)}`, alt: `≈ ${mkd} MKD` };
}
