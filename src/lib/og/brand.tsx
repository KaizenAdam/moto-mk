import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Shared pieces for the generated share images (opengraph-image.tsx files):
 * the size, colours, and the brand wordmark as a data URL (ImageResponse can't
 * read /public by URL at build time).
 */
export const OG_SIZE = { width: 1200, height: 630 };

export const OG = {
  black: "#0b0b0d",
  panel: "#141417",
  gold: "#d4af37",
  goldBright: "#f2cf5b",
  text: "#f0eee8",
  dim: "#b7b5b0",
  red: "#c1272d",
};

export async function brandIconDataUrl() {
  const png = await readFile(join(process.cwd(), "public/brand/wordmark-white.png"));
  return `data:image/png;base64,${png.toString("base64")}`;
}

/** The Just5Up! wordmark (bike + lettering), `size` px tall. */
export function OgBrand({ icon, size = 56 }: { icon: string; size?: number }) {
  // wordmark-white.png is 621×168
  return (
    // eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser
    <img src={icon} width={Math.round((size * 621) / 168)} height={size} alt="" />
  );
}
