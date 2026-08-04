"use client";

import { useMemo, useState } from "react";
import { events } from "@/lib/events";
import { EventItem } from "@/lib/types";

const TYPES: EventItem["type"][] = ["Rally", "Group Ride", "Track Day", "Meet-up"];

const TYPE_ACCENT: Record<EventItem["type"], string> = {
  Rally: "bg-rally text-paper",
  "Group Ride": "bg-pine text-paper",
  "Track Day": "bg-tarmac text-paper",
  "Meet-up": "bg-amber text-tarmac",
};

export default function EventsList() {
  const [type, setType] = useState<string>("");

  const filtered = useMemo(() => {
    return [...events]
      .filter((e) => !type || e.type === type)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [type]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setType("")}
          aria-pressed={type === ""}
          className={`px-3 py-1.5 rounded-full text-xs font-data uppercase tracking-wide border transition-colors ${
            type === "" ? "bg-tarmac text-paper border-tarmac" : "border-steel/40 text-steel-dark hover:border-tarmac"
          }`}
        >
          All events
        </button>
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            aria-pressed={type === t}
            className={`px-3 py-1.5 rounded-full text-xs font-data uppercase tracking-wide border transition-colors ${
              type === t ? "bg-tarmac text-paper border-tarmac" : "border-steel/40 text-steel-dark hover:border-tarmac"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <ol className="relative border-l-2 border-tarmac-line/30 ml-2">
        {filtered.map((event) => (
          <li key={event.slug} className="ml-6 mb-8 last:mb-0">
            <span className="absolute -left-[9px] mt-1.5 w-4 h-4 rounded-full bg-amber border-2 border-paper ring-2 ring-tarmac-line/30" />
            <div className="bg-paper rounded-xl border border-tarmac-line/10 p-5">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-data uppercase tracking-widest ${TYPE_ACCENT[event.type]}`}>
                  {event.type}
                </span>
                <span className="font-data text-xs text-steel-dark uppercase tracking-wide">
                  {new Date(event.date).toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  {event.endDate &&
                    ` – ${new Date(event.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`}
                </span>
              </div>
              <h3 className="font-display uppercase text-xl mb-1">
                {event.title}
                {event.titleMk && (
                  <span className="text-steel font-body normal-case text-sm ml-2">
                    ({event.titleMk})
                  </span>
                )}
              </h3>
              <p className="text-sm text-steel-dark mb-3">
                {event.location} · {event.region} · ~{event.attendeesEstimate} riders expected
              </p>
              <p className="text-sm text-tarmac/90 leading-relaxed max-w-2xl">
                {event.description}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {filtered.length === 0 && (
        <p className="text-steel-dark text-sm">No events of this type scheduled right now.</p>
      )}
    </div>
  );
}
