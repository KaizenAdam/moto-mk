import { createClient } from "@/lib/supabase/server";
import { getOwnProfile, getPublicProfile, listAllForAdmin } from "@/lib/data/profiles";
import { listPendingForAdmin as listPendingListings } from "@/lib/data/listings";
import {
  listPendingForAdmin as listPendingDealerRequests,
  listApprovedForAdmin as listApprovedDealerRequests,
} from "@/lib/data/dealerRequests";
import { listEvents } from "@/lib/data/events";
import { getCoverPhotoUrls } from "@/lib/data/listingPhotos";
import { listActiveDealers } from "@/lib/data/dealers";
import { listServiceCentres } from "@/lib/data/serviceCentres";
import AdminView from "./AdminView";

export default async function AdminPage() {
  const supabase = await createClient();
  const profile = await getOwnProfile(supabase);

  if (!profile) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p>
          You need to{" "}
          <a href="/login" className="text-gold-bright hover:underline">
            log in
          </a>{" "}
          to view this page.
        </p>
      </main>
    );
  }

  if (profile.account_type !== "admin") {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-ink-dim">Not authorised — this page is admin-only.</p>
      </main>
    );
  }

  const [
    pendingListings,
    pendingRequests,
    approvedDealerRequests,
    allProfiles,
    events,
    storefronts,
    serviceCentres,
  ] =
    await Promise.all([
      listPendingListings(supabase),
      listPendingDealerRequests(supabase),
      listApprovedDealerRequests(supabase),
      listAllForAdmin(supabase),
      listEvents(supabase),
      listActiveDealers(supabase),
      listServiceCentres(supabase),
    ]);
  const storefrontSlugByProfileId = new Map(storefronts.map((d) => [d.profile_id, d.slug]));

  // These depend on the rows above but not on each other — run them together.
  const [sellers, requesters, coverPhotos] = await Promise.all([
    Promise.all(pendingListings.map((l) => getPublicProfile(supabase, l.seller_id))),
    Promise.all(pendingRequests.map((r) => getPublicProfile(supabase, r.profile_id))),
    getCoverPhotoUrls(
      supabase,
      pendingListings.map((l) => l.id)
    ),
  ]);

  const dealerProfiles = allProfiles.filter((p) => p.account_type === "dealer");
  const businessNameByProfileId = new Map(
    approvedDealerRequests.map((r) => [r.profile_id, r.business_name])
  );

  return (
    <AdminView
      pendingListings={pendingListings.map((listing, i) => ({
        listing,
        sellerName: sellers[i]?.name ?? null,
        coverUrl: coverPhotos.get(listing.id),
      }))}
      pendingRequests={pendingRequests.map((request, i) => ({
        request,
        requesterName: requesters[i]?.name ?? null,
      }))}
      dealers={dealerProfiles.map((profile) => ({
        profile,
        businessName: businessNameByProfileId.get(profile.id) ?? null,
        slug: storefrontSlugByProfileId.get(profile.id) ?? null,
      }))}
      events={events}
      serviceCentres={serviceCentres}
      profiles={allProfiles}
    />
  );
}
