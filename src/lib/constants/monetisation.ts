/**
 * What can be bought on Just5Up!: featured placements for a listing, and
 * banner ad slots. The front end (the /listings/[id]/feature and /for-business
 * pages, AdSlot) reads these; the payment backend should charge from the
 * same ids. See docs/HANDOVER-backend.md.
 *
 * Prices are null until the client sets them — shown as "Price TBC".
 */

export type FeaturePackageId = "bump" | "featured-7" | "featured-30";

/** Names, summaries and perks are in the dictionaries (`packages`), by id. */
export const FEATURE_PACKAGES: {
  id: FeaturePackageId;
  priceEur: number | null;
  /** Days the listing is featured for; 0 = a one-off bump. */
  days: number;
}[] = [
  { id: "bump", priceEur: null, days: 0 },
  { id: "featured-7", priceEur: null, days: 7 },
  { id: "featured-30", priceEur: null, days: 30 },
];

export type AdSlotId = "home-banner" | "results-inline" | "listing-sidebar";

/** The slots, in page order. Names, placement and sizes are in the dictionaries (`slots`). */
export const AD_SLOT_IDS: AdSlotId[] = ["home-banner", "results-inline", "listing-sidebar"];

/** "€25", or the dictionary's "Price TBC" (`common.priceTbc`) until there's a price. */
export function formatPackagePrice(priceEur: number | null, tbc: string) {
  return priceEur == null ? tbc : `€${priceEur.toLocaleString("en-GB")}`;
}
