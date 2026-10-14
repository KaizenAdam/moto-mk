/**
 * Parts & Gear categories — the client's "Everything else motorcycle",
 * which their site map splits into two. The /parts-gear page shows these;
 * the future parts backend (docs/HANDOVER-backend.md) should store the
 * same ids rather than redefine them.
 */
export type PartCategoryId = "parts" | "gear";

export const PART_CATEGORIES: {
  id: PartCategoryId;
  name: string;
  summary: string;
  subcategories: { id: string; name: string }[];
}[] = [
  {
    id: "parts",
    name: "Spare parts & accessories",
    summary: "Tyres, exhausts, brakes and the bits that keep a bike on the road.",
    subcategories: [
      { id: "tyres", name: "Tyres" },
      { id: "exhausts", name: "Exhausts" },
      { id: "brakes", name: "Brakes" },
      { id: "lighting", name: "Lighting" },
      { id: "luggage", name: "Luggage" },
      { id: "electrics", name: "Electrics" },
    ],
  },
  {
    id: "gear",
    name: "Gear",
    summary: "Helmets, jackets and everything that keeps the rider safe.",
    subcategories: [
      { id: "helmets", name: "Helmets" },
      { id: "jackets", name: "Jackets" },
      { id: "gloves", name: "Gloves" },
      { id: "boots", name: "Boots" },
      { id: "trousers", name: "Trousers" },
      { id: "armour", name: "Body armour" },
    ],
  },
];

export const PART_CONDITIONS = ["New", "Used — like new", "Used — good", "Used — worn"] as const;
