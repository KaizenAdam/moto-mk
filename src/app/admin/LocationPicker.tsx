"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { setServiceCentreLocationAction } from "@/app/actions/admin";
import { geocodePlace } from "@/lib/map/geocode";
import { button } from "@/app/components/ui";

const LeafletMap = dynamic(() => import("@/app/components/map/LeafletMap"), { ssr: false });

type Point = { lat: number; lng: number };

/**
 * Place a service centre's map pin. "Find address" asks OpenStreetMap's
 * geocoder (from the admin's browser — fine for this kind of occasional,
 * one-at-a-time use under its usage policy), then the admin corrects it by
 * dragging the pin or clicking the map, and saves. Nothing is saved until
 * a person has looked at where the pin is.
 */
export default function LocationPicker({
  id,
  name,
  address,
  town,
  initial,
}: {
  id: string;
  name: string;
  address: string | null;
  town: string;
  initial: Point | null;
}) {
  const [open, setOpen] = useState(false);
  const [point, setPoint] = useState<Point | null>(initial);
  const [note, setNote] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  async function geocode() {
    setNote("Searching…");
    try {
      const hit = await geocodePlace({ name, address, town });
      if (!hit) {
        setNote("Couldn't find it — click the map to place the pin.");
        return;
      }
      setPoint({ lat: hit.lat, lng: hit.lng });
      setNote(
        hit.precision === "town"
          ? `Only found the town (${town}) — drag the pin to the workshop.`
          : `Found "${hit.label}". Check it, drag the pin if needed, then save.`
      );
    } catch {
      setNote("Address search failed — click the map to place the pin.");
    }
  }

  function save(location: Point | null) {
    startSaving(async () => {
      const result = await setServiceCentreLocationAction(id, location);
      if (result.error) setNote(result.error);
      else {
        setNote(location ? "Saved." : "Pin removed.");
        if (!location) setPoint(null);
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={button("outline", "sm")}
      >
        {initial ? "Move pin" : "Set location"}
      </button>
    );
  }

  return (
    <div className="mt-2 w-full space-y-2">
      <LeafletMap
        pins={point ? [{ id, ...point, label: name }] : []}
        onPick={(lat, lng) => setPoint({ lat, lng })}
        className="h-[300px]"
      />
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={geocode} className={button("outline", "sm")}>
          Find address
        </button>
        <button
          type="button"
          disabled={!point || saving}
          onClick={() => point && save(point)}
          className={button("success", "sm")}
        >
          {saving ? "Saving…" : "Save pin"}
        </button>
        {initial && (
          <button type="button" disabled={saving} onClick={() => save(null)} className={button("danger", "sm")}>
            Remove pin
          </button>
        )}
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-ink-dim hover:text-gold-bright">
          Close
        </button>
        {point && (
          <span className="text-xs text-grey">
            {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
          </span>
        )}
      </div>
      <p className="text-xs text-ink-dim">{note ?? "Click the map to drop the pin, or try Find address."}</p>
    </div>
  );
}
