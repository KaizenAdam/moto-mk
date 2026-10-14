import type { Metadata } from "next";
import PartsGearView from "./PartsGearView";

export const metadata: Metadata = {
  title: "Motorcycle parts & gear",
  description:
    "Spare parts, accessories and riding gear from riders and shops across North Macedonia — helmets, jackets, tyres, exhausts and more.",
};

/**
 * Parts & Gear: the finished page shell. There's no parts table yet
 * (docs/HANDOVER-backend.md), so every category shows an honest "no
 * listings yet" rather than sample items.
 */
export default function PartsGearPage() {
  return <PartsGearView />;
}
