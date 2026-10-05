"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { setServiceCentreLocationAction } from "@/app/actions/admin";
import { geocodePlace } from "@/lib/map/geocode";

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
        className="rounded bg-zinc-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700"
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
        <button type="button" onClick={geocode} className="rounded bg-zinc-800 px-3 py-1.5 text-xs text-white hover:bg-zinc-700">
          Find address
        </button>
        <button
          type="button"
          disabled={!point || saving}
          onClick={() => point && save(point)}
          className="rounded bg-green-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save pin"}
        </button>
        {initial && (
          <button type="button" disabled={saving} onClick={() => save(null)} className="rounded bg-red-900 px-3 py-1.5 text-xs text-white hover:bg-red-800">
            Remove pin
          </button>
        )}
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-zinc-400 hover:text-white">
          Close
        </button>
        {point && (
          <span className="text-xs text-zinc-500">
            {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
          </span>
        )}
      </div>
      <p className="text-xs text-zinc-400">{note ?? "Click the map to drop the pin, or try Find address."}</p>
    </div>
  );
}
