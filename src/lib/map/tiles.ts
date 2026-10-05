/**
 * Map tiles. Defaults to OpenStreetMap's standard tiles, darkened with a CSS
 * filter to match the site. OSM's tile servers are fine for development and
 * light use, but their usage policy rules out heavy commercial traffic: before
 * launch, set NEXT_PUBLIC_MAP_TILE_URL (and _ATTRIBUTION) to a key-based
 * provider such as MapTiler or Stadia, ideally a dark style, and set
 * NEXT_PUBLIC_MAP_TILES_DARK=1 so the filter isn't applied twice.
 */
export const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export const TILE_ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ??
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** True when the tiles are light and need darkening to fit the site. */
export const DARKEN_TILES = process.env.NEXT_PUBLIC_MAP_TILES_DARK !== "1";

/** Roughly the whole of North Macedonia. */
export const MK_CENTER: [number, number] = [41.61, 21.75];
export const MK_ZOOM = 8;
