import { Dealer } from "./types";

export const dealers: Dealer[] = [
  {
    slug: "mototech-skopje",
    name: "MotoTech Skopje",
    town: "Skopje",
    address: "Bul. Aleksandar Makedonski 88, 1000 Skopje",
    founded: 2011,
    brands: ["BMW Motorrad", "Ducati", "Harley-Davidson", "Yamaha", "Zero Motorcycles"],
    phone: "+389 70 123 456",
    description:
      "Skopje's longest-running premium multi-brand showroom. Full workshop on-site, genuine parts for all listed brands, and a finance desk for approved buyers. Every bike sold comes with a 90-day mechanical guarantee.",
    specialties: [
      "Authorised BMW Motorrad service",
      "Ducati Desmo valve servicing",
      "Pre-import inspection & registration",
      "Trade-in appraisals",
    ],
    listingSlugs: [
      "yamaha-mt-07-2021-skopje",
      "bmw-r1250gs-2022-skopje",
      "ducati-monster-937-2022-skopje",
      "harley-sportster-s-2023-skopje",
      "zero-sr-f-2022-skopje",
    ],
  },
];

export function getDealerBySlug(slug: string) {
  return dealers.find((d) => d.slug === slug);
}
