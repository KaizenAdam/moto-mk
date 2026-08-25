// Free-text convention shared by the sell form and browse filters — riding_style
// has no DB check constraint, so this list is an app-level convention, not schema.
export const RIDING_STYLES = ["Sport", "Enduro", "Cruiser", "Scooter", "Naked", "Touring"] as const;

// Must match the listings.engine_type check constraint exactly.
export const ENGINE_TYPES = [
  { value: "2-stroke", label: "2-stroke" },
  { value: "4-stroke", label: "4-stroke" },
  { value: "electric", label: "Electric" },
] as const;

// engine_cc is a plain integer column — these are "up to" thresholds, not buckets.
export const CC_THRESHOLDS = [125, 400, 650, 1000] as const;

export const PRICE_THRESHOLDS_EUR = [2000, 4000, 6000, 9000, 12000] as const;

export const EUR_TO_MKD = 61.5;

export type Currency = "EUR" | "MKD";

export function formatPrice(eur: number, currency: Currency) {
  if (currency === "MKD") {
    return {
      main: `${Math.round(eur * EUR_TO_MKD).toLocaleString()} MKD`,
      alt: `≈ €${eur.toLocaleString()}`,
    };
  }
  return {
    main: `€${eur.toLocaleString()}`,
    alt: `≈ ${Math.round(eur * EUR_TO_MKD).toLocaleString()} MKD`,
  };
}
