import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listServiceCentres } from "@/lib/data/serviceCentres";
import { canWhatsApp, formatPhone, telHref, whatsAppHref } from "@/lib/contact/phone";
import { PinIcon } from "@/app/components/icons";

export const metadata: Metadata = {
  title: "Motorcycle service centres in North Macedonia — Just5Up!",
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
      <section
        className="border-b border-line px-5 py-8"
        style={{
          background:
            "radial-gradient(circle at 80% 0%, rgba(193,39,45,.18), transparent 55%), radial-gradient(circle at 10% 100%, rgba(212,175,55,.12), transparent 50%), #0e0e11",
        }}
      >
        <div className="mx-auto max-w-[1280px]">
          <h1 className="font-display mb-1.5 text-2xl">Service Centres</h1>
          <p className="text-sm text-ink-dim">
            Workshops, official brand service centres and importers across North Macedonia.
          </p>
        </div>
      </section>

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
          <div className="rounded-[10px] border border-dashed border-line px-5 py-10 text-center text-sm text-ink-dim">
            No service centres listed here yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((c) => {
              const tel = c.phone ? telHref(c.phone) : null;
              const wa =
                c.phone && canWhatsApp(c.phone)
                  ? whatsAppHref(c.phone, `Hi ${c.name}, I found you on Just5Up!`)
                  : null;
              const mapQuery = [c.name, c.address, c.town, "North Macedonia"].filter(Boolean).join(", ");
              return (
                <div key={c.id} className="flex flex-col rounded-[10px] border border-line bg-panel p-5">
                  <div className="mb-1.5 flex items-start justify-between gap-3">
                    <h2 className="font-display text-lg text-ink">{c.name}</h2>
                    {c.verified && (
                      <span className="shrink-0 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-[#141414] uppercase">
                        Verified
                      </span>
                    )}
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-2 flex items-center gap-1.5 text-sm text-grey hover:text-gold-bright"
                  >
                    <PinIcon />
                    {c.address ? `${c.address}, ${c.town}` : c.town}
                  </a>
                  {c.specialties && <p className="mb-4 text-sm text-ink-dim">{c.specialties}</p>}

                  <div className="mt-auto flex flex-wrap items-center gap-2">
                    {wa && (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md bg-[#25D366] px-3.5 py-2 text-xs font-bold tracking-wide text-[#0b0b0d] uppercase hover:brightness-110"
                      >
                        WhatsApp
                      </a>
                    )}
                    {tel && c.phone && (
                      <a
                        href={tel}
                        className="rounded-md border border-line px-3.5 py-2 text-xs font-bold tracking-wide text-ink uppercase hover:border-gold"
                      >
                        Call {formatPhone(c.phone)}
                      </a>
                    )}
                    {c.website && (
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold tracking-wide text-gold-bright uppercase hover:underline"
                      >
                        Website
                      </a>
                    )}
                  </div>
                  {!c.verified && (
                    <p className="mt-3 text-[11px] text-grey">
                      From public directories — call ahead to confirm details.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
