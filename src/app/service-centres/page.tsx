import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listServiceCentres } from "@/lib/data/serviceCentres";
import ServiceCentresExplorer from "./ServiceCentresExplorer";
import { BlockHero, Eyebrow, HighlightWord, RedBand, blackButton } from "@/app/components/Bands";
import { TickIcon } from "@/app/components/icons";
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

  const verified = centres.filter((c) => c.verified).length;

  const chip = (active: boolean) =>
    `font-display border px-3.5 py-2 text-sm tracking-[.04em] transition ${
      active ? "border-highlight bg-highlight text-[#111]" : "border-line bg-panel text-ink hover:border-highlight"
    }`;

  return (
    <main className="pb-16">
      <BlockHero
        gradient
        shard={{ shape: "double", className: "top-[18%] right-[-200px] h-[110%] w-[460px] -scale-x-100 -rotate-[10deg] bg-highlight/[.10] sm:right-[2%] sm:w-[560px]" }}
        title={
          <>
            Find a
            <br />
            <HighlightWord>workshop</HighlightWord>
          </>
        }
        intro="Workshops, official brand service centres and importers across North Macedonia."
        ticks={
          centres.length > 0
            ? [
                `${centres.length} service centre${centres.length === 1 ? "" : "s"}`,
                `${towns.length} town${towns.length === 1 ? "" : "s"}`,
                ...(verified > 0 ? [`${verified} checked by phone or visit`] : []),
                "Call, WhatsApp and directions",
              ]
            : undefined
        }
      />

      <div className="mx-auto max-w-[1280px] px-5 pt-10">
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

      <RedBand
        className="mt-16"
        shard={{ shape: "bent", className: "bottom-[-90px] left-[-70px] h-[480px] w-[380px] -rotate-[14deg] bg-black/[.16]" }}
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>For business</Eyebrow>
            <h2 className="font-display text-4xl leading-none sm:text-[44px]">Run a workshop?</h2>
            <p className="mt-3 max-w-md text-[15px]">
              Get your workshop in front of riders looking for a service, a repair or new tyres. Listing is free.
            </p>
            <Link href="/for-business#service" className={`${blackButton} mt-6`}>
              Get listed &gt;&gt;&gt;
            </Link>
          </div>
          <ul className="space-y-3">
            {["Listed free, on the map", "Call, WhatsApp and directions on your card", "Added by the Just5Up! team"].map((p) => (
              <li key={p} className="flex items-center gap-4 bg-[#0a0a0a] px-5 py-4">
                <TickIcon className="h-5 w-5 shrink-0 text-highlight" />
                <span className="font-display text-lg font-normal">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </RedBand>
    </main>
  );
}
