import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listServiceCentres } from "@/lib/data/serviceCentres";
import ServiceCentresExplorer from "./ServiceCentresExplorer";
import PageHero from "@/app/components/PageHero";
import EmptyState from "@/app/components/EmptyState";

export const metadata: Metadata = {
  title: "Motorcycle service centres in North Macedonia",
  description:
    "Motorcycle and scooter workshops, official brand service centres and importers across North Macedonia.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ServiceCentresPage({ searchParams }: { searchParams: SearchParams }) {
  const { town: townParam } = await searchParams;
  const selectedTown = typeof townParam === "string" ? townParam : null;

  const centres = await listServiceCentres(await createClient());
  const towns = [...new Set(centres.map((c) => c.town))].sort();
  const shown = selectedTown ? centres.filter((c) => c.town === selectedTown) : centres;

  const chip = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-[13px] transition ${
      active ? "border-gold bg-gold text-[#141414] font-bold" : "border-line bg-panel2 text-ink hover:border-gold"
    }`;

  return (
    <main>
      <PageHero
        title="Service Centres"
        intro="Workshops, official brand service centres and importers across North Macedonia."
      />

      <div className="mx-auto max-w-[1280px] px-6 py-8 pb-14">
        {towns.length > 1 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Link href="/service-centres" className={chip(!selectedTown)}>
              All towns
            </Link>
            {towns.map((t) => (
              <Link key={t} href={`/service-centres?town=${encodeURIComponent(t)}`} className={chip(t === selectedTown)}>
                {t}
              </Link>
            ))}
          </div>
        )}

        {shown.length === 0 ? (
          <EmptyState>No service centres listed here yet.</EmptyState>
        ) : (
          <ServiceCentresExplorer key={selectedTown ?? "all"} centres={shown} />
        )}
      </div>
    </main>
  );
}
