"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setServiceCentreLocationAction } from "@/app/actions/admin";
import { geocodeAll, type GeocodeResult } from "@/lib/map/geocode";

const LeafletMap = dynamic(() => import("@/app/components/map/LeafletMap"), { ssr: false });

type Centre = { id: string; name: string; address: string | null; town: string };

type Item = {
  state: "waiting" | "found" | "not-found" | "failed" | "saving" | "saved";
  result?: GeocodeResult;
  point?: { lat: number; lng: number };
  moved?: boolean;
  error?: string;
};

const precisionNote: Record<GeocodeResult["precision"], string> = {
  address: "matched the street address",
  name: "matched the business name",
  town: "only found the town — drag it to the workshop",
};

/**
 * Looks up every centre that isn't on the map yet, then shows all the
 * suggested pins on one map for review. Pins are draggable; nothing is
 * saved until the admin presses Save. A town-only match can't be saved
 * until its pin has been moved, so the map never gets a pin in the middle
 * of a town pretending to be a workshop.
 */
export default function LocateAll({ centres }: { centres: Centre[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Record<string, Item>>({});
  const [running, setRunning] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (centres.length === 0) return null;

  const patch = (id: string, change: Partial<Item>) =>
    setItems((all) => ({ ...all, [id]: { ...all[id], ...change } }));

  async function locate() {
    setRunning(true);
    setItems(Object.fromEntries(centres.map((c) => [c.id, { state: "waiting" } as Item])));
    await geocodeAll(centres, (id, result, error) =>
      patch(
        id,
        result
          ? { state: "found", result, point: { lat: result.lat, lng: result.lng } }
          : { state: error ? "failed" : "not-found", error }
      )
    );
    setRunning(false);
  }

  const canSave = (it?: Item) =>
    !!it?.point && it.state === "found" && (it.result?.precision !== "town" || it.moved);

  async function save(ids: string[]) {
    for (const id of ids) {
      const point = items[id]?.point;
      if (!point) continue;
      patch(id, { state: "saving" });
      const res = await setServiceCentreLocationAction(id, point);
      patch(id, res.error ? { state: "found", error: res.error } : { state: "saved", error: undefined });
    }
    router.refresh();
  }

  const started = Object.keys(items).length > 0;
  const done = Object.values(items).filter((i) => i.state !== "waiting").length;
  const saveable = centres.filter((c) => canSave(items[c.id])).map((c) => c.id);
  const pins = centres
    .filter((c) => items[c.id]?.point && items[c.id].state !== "saved")
    .map((c) => ({ id: c.id, ...items[c.id].point!, label: c.name }));

  return (
    <div className="mb-4 rounded border border-amber-700/50 bg-zinc-950 p-4 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={locate}
          disabled={running}
          className="rounded bg-amber-400 px-3 py-1.5 text-xs font-medium text-black hover:bg-amber-300 disabled:opacity-60"
        >
          {running ? `Looking up… ${done}/${centres.length}` : started ? "Look up again" : `Locate all ${centres.length} not on the map`}
        </button>
        {started && !running && saveable.length > 0 && (
          <button
            type="button"
            onClick={() => save(saveable)}
            className="rounded bg-green-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600"
          >
            Save {saveable.length} reviewed pin{saveable.length > 1 ? "s" : ""}
          </button>
        )}
        <span className="text-xs text-zinc-500">
          Searches OpenStreetMap from your browser, about a second per centre.
        </span>
      </div>

      {started && (
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_320px]">
          <LeafletMap
            pins={pins}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onPinDrag={(id, lat, lng) => {
              patch(id, { point: { lat, lng }, moved: true });
              setSelectedId(id);
            }}
            className="h-[380px]"
          />
          <ul className="space-y-1.5 lg:max-h-[380px] lg:overflow-y-auto">
            {centres.map((c) => {
              const it = items[c.id];
              return (
                <li
                  key={c.id}
                  onClick={() => it?.point && setSelectedId(c.id)}
                  className={`rounded border p-2 ${selectedId === c.id ? "border-amber-400" : "border-zinc-800"} ${it?.point ? "cursor-pointer" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-white">{c.name}</span>
                    {canSave(it) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          save([c.id]);
                        }}
                        className="rounded bg-green-700 px-2 py-0.5 text-[11px] text-white hover:bg-green-600"
                      >
                        Save
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">
                    {!it || it.state === "waiting"
                      ? "Waiting…"
                      : it.state === "saving"
                        ? "Saving…"
                        : it.state === "saved"
                          ? "✓ Saved — now on the public map"
                          : it.state === "not-found"
                            ? "Not found — use Set location below and click the map"
                            : it.state === "failed"
                              ? `Search failed: ${it.error}`
                              : it.moved
                                ? "Pin moved by you — ready to save"
                                : precisionNote[it.result!.precision]}
                  </p>
                  {it?.error && it.state === "found" && <p className="text-xs text-red-400">{it.error}</p>}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
