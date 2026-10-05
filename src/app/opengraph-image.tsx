import { ImageResponse } from "next/og";
import { OG, OG_SIZE, OgBrand, brandIconDataUrl } from "@/lib/og/brand";

export const alt = "Just5Up! — North Macedonia's motorcycle marketplace";
export const size = OG_SIZE;
export const contentType = "image/png";

/** Default share image for every page that doesn't make its own. */
export default async function Image() {
  const icon = await brandIconDataUrl();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: `radial-gradient(circle at 85% 0%, rgba(193,39,45,.35), transparent 55%), radial-gradient(circle at 0% 100%, rgba(212,175,55,.25), transparent 50%), ${OG.black}`,
          color: OG.text,
        }}
      >
        <OgBrand icon={icon} size={72} />
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, display: "flex", flexWrap: "wrap" }}>
            Find your next ride in&nbsp;<span style={{ color: OG.goldBright }}>North Macedonia</span>
          </div>
          <div style={{ fontSize: 32, color: OG.dim }}>
            Motorcycles from riders and verified dealers · Free to list
          </div>
        </div>
      </div>
    ),
    size
  );
}
