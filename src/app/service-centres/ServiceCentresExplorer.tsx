"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { Tables } from "@/lib/database.types";
import { canWhatsApp, formatPhone, telHref, whatsAppHref } from "@/lib/contact/phone";
import { PinIcon } from "@/app/components/icons";
import { button } from "@/app/components/ui";

const LeafletMap = dynamic(() => import("@/app/components/map/LeafletMap"), {
  ssr: false,
  loading: () => <div className="h-[420px] w-full animate-pulse rounded-[10px] border border-line bg-panel" />,
});

type Centre = Tables<"service_centres">;

/**
 * Map + list. Clicking a pin highlights its card; clicking a card flies the
 * map to its pin. Centres without a placed pin are still listed, below.
 */
export default function ServiceCentresExplorer({ centres }: { centres: Centre[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pinned = centres.filter((c) => c.lat != null && c.lng != null);
  const unpinned = centres.filter((c) => c.lat == null || c.lng == null);
  const pins = pinned.map((c) => ({ id: c.id, lat: c.lat!, lng: c.lng!, label: c.name }));

  function select(id: string) {
    setSelectedId(id);
    document.getElementById(`centre-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <LeafletMap pins={pins} selectedId={selectedId} onSelect={select} className="h-[360px] lg:h-[560px]" />
        {pins.length === 0 && (
          <p className="mt-2 text-xs text-grey">Pins appear here as each centre&rsquo;s location is confirmed.</p>
        )}
      </div>

      <div className="space-y-3 lg:max-h-[560px] lg:overflow-y-auto lg:pr-1">
        {pinned.map((c) => (
          <CentreCard key={c.id} centre={c} active={c.id === selectedId} onClick={() => setSelectedId(c.id)} />
        ))}
        {unpinned.length > 0 && (
          <>
            {pinned.length > 0 && (
              <p className="pt-3 text-xs font-bold tracking-wide text-grey uppercase">Not on the map yet</p>
            )}
            {unpinned.map((c) => (
              <CentreCard key={c.id} centre={c} active={false} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function CentreCard({ centre: c, active, onClick }: { centre: Centre; active: boolean; onClick?: () => void }) {
  const tel = c.phone ? telHref(c.phone) : null;
  const wa = c.phone && canWhatsApp(c.phone) ? whatsAppHref(c.phone, `Hi ${c.name}, I found you on Just5Up!`) : null;
  const mapQuery =
    c.lat != null && c.lng != null
      ? `${c.lat},${c.lng}`
      : [c.name, c.address, c.town, "North Macedonia"].filter(Boolean).join(", ");

  return (
    <div
      id={`centre-${c.id}`}
      onClick={onClick}
      className={`rounded-[10px] border bg-panel p-4 transition ${
        active ? "border-gold" : "border-line"
      } ${onClick ? "cursor-pointer hover:border-gold" : ""}`}
    >
      <div className="mb-1 flex items-start justify-between gap-3">
        <h2 className="font-display text-base text-ink">{c.name}</h2>
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
        onClick={(e) => e.stopPropagation()}
        className="mb-1.5 flex items-center gap-1.5 text-sm text-grey hover:text-gold-bright"
      >
        <PinIcon />
        {c.address ? `${c.address}, ${c.town}` : c.town}
      </a>
      {c.specialties && <p className="mb-3 text-[13px] text-ink-dim">{c.specialties}</p>}
      <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className={button("whatsapp", "sm")}
          >
            WhatsApp
          </a>
        )}
        {tel && c.phone && (
          <a
            href={tel}
            className={button("outline", "sm")}
          >
            Call {formatPhone(c.phone)}
          </a>
        )}
        {c.website && (
          <a
            href={c.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold tracking-wide text-gold-bright uppercase hover:underline"
          >
            Website
          </a>
        )}
      </div>
      {!c.verified && (
        <p className="mt-2.5 text-[11px] text-grey">From public directories — call ahead to confirm details.</p>
      )}
    </div>
  );
}
