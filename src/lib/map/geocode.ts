/**
 * Browser-only address lookup via OpenStreetMap's Nominatim, used by the
 * admin pin tools. Nominatim's usage policy allows light use like this but
 * at most one request per second — callers doing several must space them
 * (see `geocodeAll`). Results are suggestions for a person to check, never
 * saved without review.
 */

export type GeocodeResult = {
  lat: number;
  lng: number;
  label: string;
  /** How specific the match was. "town" means only the town was found. */
  precision: "address" | "name" | "town";
};

type Place = { name: string; address: string | null; town: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function search(q: string) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=mk&q=${encodeURIComponent(q)}`,
    { headers: { Accept: "application/json" } }
  );
  if (!res.ok) throw new Error(`Address search failed (${res.status})`);
  const [hit] = (await res.json()) as { lat: string; lon: string; display_name: string }[];
  return hit ? { lat: Number(hit.lat), lng: Number(hit.lon), label: hit.display_name } : null;
}

/** Most specific query first; a bare town is the last resort. */
export async function geocodePlace(place: Place): Promise<GeocodeResult | null> {
  const attempts: [string, GeocodeResult["precision"]][] = [];
  if (place.address) attempts.push([`${place.address}, ${place.town}`, "address"]);
  attempts.push([`${place.name}, ${place.town}`, "name"], [place.town, "town"]);
  for (const [i, [q, precision]] of attempts.entries()) {
    if (i > 0) await sleep(1100); // one request per second
    const hit = await search(q);
    if (hit) return { ...hit, precision };
  }
  return null;
}

/** Looks up several places one at a time, reporting each as it lands. */
export async function geocodeAll<T extends Place & { id: string }>(
  places: T[],
  onResult: (id: string, result: GeocodeResult | null, error?: string) => void
) {
  for (const [i, place] of places.entries()) {
    if (i > 0) await sleep(1100);
    try {
      onResult(place.id, await geocodePlace(place));
    } catch (e) {
      onResult(place.id, null, e instanceof Error ? e.message : "Search failed");
    }
  }
}
