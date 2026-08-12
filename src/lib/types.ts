export type EngineType = "2-stroke" | "4-stroke" | "electric";
export type LicenseCategory = "AM" | "A1" | "A2" | "A";
export type RidingStyle =
  | "Enduro"
  | "Sport"
  | "Cruiser"
  | "Scooter"
  | "Touring"
  | "Naked"
  | "Adventure";

export type Town =
  | "Skopje"
  | "Bitola"
  | "Ohrid"
  | "Kumanovo"
  | "Tetovo"
  | "Prilep"
  | "Strumica"
  | "Veles"
  | "Gostivar";

export interface Listing {
  slug: string;
  /** Optional real photo path (e.g. "/bikes/{slug}.jpg"). Falls back to the
   * icon placeholder where absent. Only consumed by the Just5Up listings
   * page today; other pages still render the placeholder unconditionally. */
  photoUrl?: string;
  make: string;
  model: string;
  year: number;
  priceEur: number;
  cc: number;
  engineType: EngineType;
  licenseCategory: LicenseCategory;
  ridingStyle: RidingStyle;
  town: Town;
  mileageKm: number;
  condition: "New" | "Used" | "Salvage";
  colour: string;
  description: string;
  featured?: boolean;
  sellerType: "Private" | "Dealer";
  dealerSlug?: string;
  sellerName: string;
  phone: string;
  postedDaysAgo: number;
}

export interface EventItem {
  slug: string;
  title: string;
  titleMk?: string;
  date: string; // ISO
  endDate?: string;
  location: Town | string;
  region: string;
  description: string;
  type: "Rally" | "Group Ride" | "Track Day" | "Meet-up";
  attendeesEstimate: number;
}

export interface Dealer {
  slug: string;
  name: string;
  town: Town;
  address: string;
  founded: number;
  brands: string[];
  phone: string;
  description: string;
  specialties: string[];
  listingSlugs: string[];
}
