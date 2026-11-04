import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import PartsGearView from "./PartsGearView";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.meta.partsTitle,
    description: t.meta.partsDescription,
  };
}

/**
 * Parts & Gear: the finished page shell. There's no parts table yet
 * (docs/HANDOVER-backend.md), so every category shows an honest "no
 * listings yet" rather than sample items.
 */
export default function PartsGearPage() {
  return <PartsGearView />;
}
