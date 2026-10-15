import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { countActive, listLatest, listStyleShowcase } from "@/lib/data/listings";
import { getCoverPhotos } from "@/lib/data/listingPhotos";
import { cachedPhotoSigner } from "@/lib/photos/signer";
import { listUpcoming } from "@/lib/data/events";
import { listServiceCentres } from "@/lib/data/serviceCentres";
import { RIDING_STYLES } from "@/lib/constants/listings";
import HomeView from "./_home/HomeView";

export const metadata: Metadata = {
  // The layout's default title is the home page's; only the description is more specific.
  description:
    "Motorcycles for sale across North Macedonia from riders and verified dealers — plus service centres, events and the riding community.",
};

/** The landing page. Fetches; HomeView lays it out. */
export default async function Home() {
  const supabase = await createClient();

  const [bikeCount, styles, latest, events, centres] = await Promise.all([
    countActive(supabase),
    listStyleShowcase(supabase, RIDING_STYLES),
    listLatest(supabase, 4),
    listUpcoming(supabase),
    listServiceCentres(supabase),
  ]);

  // Covers need the listing ids above.
  const styleCoverIds = styles.flatMap((s) => (s.newestId ? [s.newestId] : []));
  const covers = await getCoverPhotos(
    supabase,
    [...new Set([...latest.map((l) => l.id), ...styleCoverIds])],
    cachedPhotoSigner(supabase)
  );

  return (
    <HomeView
      totalBikes={bikeCount}
      styles={styles.map((s) => ({
        style: s.style,
        count: s.count,
        coverUrl: (s.newestId && covers.get(s.newestId)?.url) || null,
      }))}
      // No paid placements exist yet, so this is the newest bikes — never
      // call them Featured. See docs/HANDOVER-backend.md.
      latestAreFeatured={false}
      latest={latest.map((l) => ({ listing: l, photoUrl: covers.get(l.id)?.url ?? undefined }))}
      events={events.slice(0, 3)}
      serviceCentreCount={centres.length}
    />
  );
}
