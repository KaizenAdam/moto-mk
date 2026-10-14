import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { countActive, countActiveBySeller, listLatest, listStyleShowcase } from "@/lib/data/listings";
import { getCoverPhotos } from "@/lib/data/listingPhotos";
import { cachedPhotoSigner } from "@/lib/photos/signer";
import { getOwnProfile } from "@/lib/data/profiles";
import { listSaved } from "@/lib/data/savedListings";
import { listActiveDealers } from "@/lib/data/dealers";
import { listUpcoming } from "@/lib/data/events";
import { listServiceCentres } from "@/lib/data/serviceCentres";
import { RIDING_STYLES } from "@/lib/constants/listings";
import HomeView from "./_home/HomeView";

export const metadata: Metadata = {
  // The layout's default title is the home page's; only the description is more specific.
  description:
    "Motorcycles for sale across North Macedonia from riders and verified dealers — plus service centres, events and the riding community.",
};

/** The landing hub. Fetches; HomeView lays it out. */
export default async function Home() {
  const supabase = await createClient();

  const [bikeCount, styles, latest, profile, saved, dealers, events, centres] = await Promise.all([
    countActive(supabase),
    listStyleShowcase(supabase, RIDING_STYLES),
    listLatest(supabase, 6),
    getOwnProfile(supabase),
    listSaved(supabase),
    listActiveDealers(supabase),
    listUpcoming(supabase),
    listServiceCentres(supabase),
  ]);

  // Covers need the listing ids above; stock counts need the dealer ids.
  const styleCoverIds = styles.flatMap((s) => (s.newestId ? [s.newestId] : []));
  const [covers, stock] = await Promise.all([
    getCoverPhotos(supabase, [...new Set([...latest.map((l) => l.id), ...styleCoverIds])], cachedPhotoSigner(supabase)),
    countActiveBySeller(supabase, dealers.map((d) => d.profile_id)),
  ]);

  const savedIds = new Set(saved.map((s) => s.listing_id));
  const dealerNames = new Map(dealers.map((d) => [d.profile_id, d.business_name]));

  return (
    <HomeView
      isLoggedIn={!!profile}
      stats={{ bikes: bikeCount, dealers: dealers.length, serviceCentres: centres.length, events: events.length }}
      styles={styles.map((s) => ({
        style: s.style,
        count: s.count,
        coverUrl: (s.newestId && covers.get(s.newestId)?.url) || null,
      }))}
      // No paid placements exist yet, so this is the newest bikes — never
      // badge them Featured. See docs/HANDOVER-backend.md.
      latestAreFeatured={false}
      latest={latest.map((l) => ({
        listing: l,
        saved: savedIds.has(l.id),
        photoUrl: covers.get(l.id)?.url ?? undefined,
        photoCount: covers.get(l.id)?.count ?? 0,
        dealerName: dealerNames.get(l.seller_id),
      }))}
      events={events.slice(0, 5)}
      serviceCentres={{ count: centres.length, towns: [...new Set(centres.map((c) => c.town))].sort() }}
      dealers={[...dealers]
        .map((d) => ({ slug: d.slug, business_name: d.business_name, town: d.town, stock: stock.get(d.profile_id) ?? 0 }))
        .sort((a, b) => b.stock - a.stock)}
    />
  );
}
