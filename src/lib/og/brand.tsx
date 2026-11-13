import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Shared pieces for the generated share images (opengraph-image.tsx files):
 * the size, colours, and the brand wordmark as a data URL (ImageResponse can't
 * read /public by URL at build time).
 */
export const OG_SIZE = { width: 1200, height: 630 };

export const OG = {
  black: "#332b26",
  panel: "#3c332d",
  gold: "#dbc078",
  goldBright: "#dbc078",
  text: "#f0eee8",
  dim: "#b7b5b0",
  red: "#c1272d",
};

export async function brandIconDataUrl() {
  const png = await readFile(join(process.cwd(), "public/brand/logo-moto-hut.png"));
  return `data:image/png;base64,${png.toString("base64")}`;
}

/** The Moto Hut logo (gold bike, white lettering), `size` px tall. */
export function OgBrand({ icon, size = 56 }: { icon: string; size?: number }) {
  // logo-moto-hut.png is 619×116
  return (
    // eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser
    <img src={icon} width={Math.round((size * 619) / 116)} height={size} alt="" />
  );
}
