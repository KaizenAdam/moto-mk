import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { getById } from "@/lib/data/listings";
import { getCoverPhotoUrls } from "@/lib/data/listingPhotos";
import { cachedPhotoSigner } from "@/lib/photos/signer";
import { EUR_TO_MKD } from "@/lib/constants/listings";
import { OG, OG_SIZE, OgBrand, brandIconDataUrl } from "@/lib/og/brand";

export const alt = "Motorcycle for sale on Just5Up!";
export const size = OG_SIZE;
export const contentType = "image/png";

/**
 * What WhatsApp/Facebook/Viber show when a bike is shared: its photo,
 * name, price and town. Fetched as a signed-out visitor (that's who a
 * link-preview crawler is), so only live listings get a real card;
 * anything else gets the plain brand card.
 */
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const [icon, listing] = await Promise.all([brandIconDataUrl(), getById(supabase, id).catch(() => null)]);
  const photo =
    listing && (await getCoverPhotoUrls(supabase, [listing.id], cachedPhotoSigner(supabase)).catch(() => null))?.get(listing.id);

  if (!listing) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: OG.black }}>
          <OgBrand icon={icon} size={96} />
        </div>
      ),
      size
    );
  }

  const name = [listing.year, listing.make, listing.model].filter(Boolean).join(" ");
  const eur = Number(listing.price_eur);
  const specs = [
    listing.engine_cc != null ? `${listing.engine_cc}cc` : null,
    listing.mileage_km != null ? `${listing.mileage_km.toLocaleString("en-GB")} km` : null,
    listing.riding_style,
  ].filter(Boolean) as string[];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: OG.black, color: OG.text }}>
        <div style={{ width: 630, height: 630, display: "flex", background: OG.panel }}>
          {photo ? (
             
            <img src={photo} width={630} height={630} alt="" style={{ objectFit: "cover" }} />
          ) : (
            <div style={{ margin: "auto", display: "flex" }}>
              <OgBrand icon={icon} size={80} />
            </div>
          )}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px 48px 44px" }}>
          <OgBrand icon={icon} size={44} />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.08 }}>{name}</div>
            <div style={{ fontSize: 60, fontWeight: 800, color: OG.goldBright }}>€{eur.toLocaleString("en-GB")}</div>
            <div style={{ fontSize: 24, color: OG.dim }}>
              ≈ {Math.round(eur * EUR_TO_MKD).toLocaleString("en-GB")} MKD
            </div>
            {specs.length > 0 && (
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                {specs.map((s) => (
                  <div key={s} style={{ fontSize: 22, padding: "6px 14px", borderRadius: 8, border: "2px solid #2a2a2f", color: OG.dim }}>
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ fontSize: 28, color: OG.gold, display: "flex" }}>{listing.town ? `${listing.town}, North Macedonia` : "North Macedonia"}</div>
        </div>
      </div>
    ),
    size
  );
}
