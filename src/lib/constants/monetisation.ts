/**
 * What can be bought on Just5Up!: featured placements for a listing, and
 * banner ad slots. The front end (the /listings/[id]/feature and /advertise
 * pages, AdSlot) reads these; the payment backend should charge from the
 * same ids. See docs/HANDOVER-backend.md.
 *
 * Prices are null until the client sets them — shown as "Price TBC".
 */

export type FeaturePackageId = "bump" | "featured-7" | "featured-30";

export const FEATURE_PACKAGES: {
  id: FeaturePackageId;
  name: string;
  summary: string;
  perks: string[];
  priceEur: number | null;
  /** Days the listing is featured for; 0 = a one-off bump. */
  days: number;
}[] = [
  {
    id: "bump",
    name: "Bump to top",
    summary: "Your bike jumps back to the top of the newest listings.",
    perks: ["Back to the top of search, once", "Good for a fresh price drop"],
    priceEur: null,
    days: 0,
  },
  {
    id: "featured-7",
    name: "Featured — 7 days",
    summary: "Shown above ordinary listings with a gold Featured frame for a week.",
    perks: ["Above ordinary listings in search", "Gold Featured frame and badge", "Shown on the home page"],
    priceEur: null,
    days: 7,
  },
  {
    id: "featured-30",
    name: "Featured — 30 days",
    summary: "A month at the top, for bikes that need more time to find the right buyer.",
    perks: ["Everything in 7 days", "Four times as long", "Best value per day"],
    priceEur: null,
    days: 30,
  },
];

export type AdSlotId = "home-banner" | "results-inline" | "listing-sidebar";

export const AD_SLOTS: Record<AdSlotId, { name: string; where: string; size: string }> = {
  "home-banner": {
    name: "Home page banner",
    where: "Full width on the home page, under the latest bikes",
    size: "1200 × 200 px (wide), 600 × 300 px (phones)",
  },
  "results-inline": {
    name: "Search results banner",
    where: "Between rows of bikes in search results",
    size: "1200 × 160 px (wide), 600 × 300 px (phones)",
  },
  "listing-sidebar": {
    name: "Listing page panel",
    where: "Beside every bike's page, under the contact card",
    size: "360 × 300 px",
  },
};

/** "€25" or "Price TBC". */
export function formatPackagePrice(priceEur: number | null) {
  return priceEur == null ? "Price TBC" : `€${priceEur.toLocaleString("en-GB")}`;
}
