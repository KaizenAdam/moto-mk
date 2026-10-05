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
import {
  approveListingAction,
  rejectListingAction,
  approveDealerRequestAction,
  rejectDealerRequestAction,
  deleteEventAction,
  deleteServiceCentreAction,
  setServiceCentreVerifiedAction,
} from "@/app/actions/admin";
import AddEventForm from "./AddEventForm";
import AdminAction from "./AdminAction";
import AddServiceCentreForm from "./AddServiceCentreForm";
import LocationPicker from "./LocationPicker";
import LocateAll from "./LocateAll";
import { sectionTitle } from "@/app/components/ui";

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
    <main className="px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-10">
        <h1 className="font-display text-3xl">Admin portal</h1>

        <section>
          <h2 className={sectionTitle}>
            Pending listings ({pendingListings.length})
          </h2>
          {pendingListings.length === 0 && (
            <p className="text-sm text-grey">Nothing waiting on review.</p>
          )}
          <div className="space-y-3">
            {pendingListings.map((listing, i) => (
              <div key={listing.id} className="flex gap-4 rounded-[10px] border border-line bg-panel p-4 text-sm">
                <a href={`/listings/${listing.id}`} className="shrink-0" title="Open listing">
                  {coverPhotos.get(listing.id) ? (
                    // eslint-disable-next-line @next/next/no-img-element -- signed URL rotates per request
                    <img
                      src={coverPhotos.get(listing.id)}
                      alt=""
                      className="h-20 w-28 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-28 items-center justify-center rounded bg-panel2 text-xs text-grey">
                      No photo
                    </div>
                  )}
                </a>
                <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">
                  {listing.make} {listing.model} — {listing.title}
                </p>
                <p className="text-ink-dim">
                  {listing.year ?? "—"} · {listing.engine_cc ?? "—"}cc ·{" "}
                  {listing.engine_type ?? "—"} · {listing.riding_style ?? "—"} · €
                  {Number(listing.price_eur).toLocaleString()} · {listing.town ?? "—"}
                </p>
                <p className="text-grey">Seller: {sellers[i]?.name ?? "—"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <AdminAction action={approveListingAction.bind(null, listing.id)} label="Approve" tone="approve" />
                  <AdminAction action={rejectListingAction.bind(null, listing.id)} label="Reject" tone="reject" withReason />
                </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className={sectionTitle}>
            Pending dealer requests ({pendingRequests.length})
          </h2>
          {pendingRequests.length === 0 && (
            <p className="text-sm text-grey">Nothing waiting on review.</p>
          )}
          <div className="space-y-3">
            {pendingRequests.map((req, i) => (
              <div key={req.id} className="rounded-[10px] border border-line bg-panel p-4 text-sm">
                <p className="font-semibold text-ink">{req.business_name}</p>
                <p className="text-ink-dim">
                  {req.address ?? "—"} · {req.phone ?? "—"}
                </p>
                <p className="text-grey">Requested by: {requesters[i]?.name ?? "—"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <AdminAction action={approveDealerRequestAction.bind(null, req.id)} label="Approve" tone="approve" />
                  <AdminAction action={rejectDealerRequestAction.bind(null, req.id)} label="Reject" tone="reject" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className={sectionTitle}>Dealers ({dealerProfiles.length})</h2>
          {dealerProfiles.length === 0 && (
            <p className="text-sm text-grey">No approved dealers yet.</p>
          )}
          <div className="space-y-2">
            {dealerProfiles.map((p) => (
              <div key={p.id} className="rounded-[10px] border border-line bg-panel p-3 text-sm">
                <p className="font-semibold text-ink">
                  {p.name ?? "—"}
                  {storefrontSlugByProfileId.has(p.id) && (
                    <a
                      href={`/dealers/${storefrontSlugByProfileId.get(p.id)}`}
                      className="ml-2 text-xs font-normal text-gold-bright hover:underline"
                    >
                      storefront →
                    </a>
                  )}
                </p>
                <p className="text-ink-dim">
                  {businessNameByProfileId.get(p.id) ?? "—"} · {p.town ?? "—"} · {p.phone ?? "—"}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className={sectionTitle}>Events ({events.length})</h2>
          {events.length === 0 && <p className="text-sm text-grey">No events yet.</p>}
          <div className="space-y-2">
            {events.map((event) => (
              <div key={event.id} className="rounded-[10px] border border-line bg-panel p-3 text-sm">
                <p className="font-semibold text-ink">{event.title}</p>
                <p className="text-ink-dim">
                  {event.event_date ?? "No date"} · {event.location ?? "No location"}
                </p>
                {event.description && <p className="text-grey">{event.description}</p>}
                <div className="mt-2">
                  <AdminAction action={deleteEventAction.bind(null, event.id)} label="Delete" tone="reject" />
                </div>
              </div>
            ))}
          </div>
          <AddEventForm />
        </section>

        <section>
          <h2 className={sectionTitle}>
            Service centres ({serviceCentres.length}, {serviceCentres.filter((c) => c.verified).length} verified,{" "}
            {serviceCentres.filter((c) => c.lat != null).length} on the map)
          </h2>
          <p className="mb-3 text-xs text-grey">
            Unverified entries show a &ldquo;call ahead to confirm&rdquo; note on the public page. Mark one
            verified once you&rsquo;ve confirmed it by phone or visit.
          </p>
          <LocateAll
            centres={serviceCentres
              .filter((c) => c.lat == null)
              .map((c) => ({ id: c.id, name: c.name, address: c.address, town: c.town }))}
          />
          <div className="space-y-2">
            {serviceCentres.map((c) => (
              <div key={c.id} className="rounded-[10px] border border-line bg-panel p-3 text-sm">
                <p className="font-semibold text-ink">
                  {c.name}{" "}
                  <span className={c.verified ? "text-xs text-green-500" : "text-xs text-grey"}>
                    {c.verified ? "verified" : "unverified"}
                  </span>{" "}
                  <span className={c.lat != null ? "text-xs text-green-500" : "text-xs text-gold"}>
                    {c.lat != null ? "on map" : "not on map"}
                  </span>
                </p>
                <p className="text-ink-dim">
                  {c.town} · {c.address ?? "no address"} · {c.phone ?? "no phone"}
                </p>
                {c.source_url && (
                  <a href={c.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gold-bright hover:underline">
                    source
                  </a>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <AdminAction
                    action={setServiceCentreVerifiedAction.bind(null, c.id, !c.verified)}
                    label={c.verified ? "Mark unverified" : "Mark verified"}
                    tone="approve"
                  />
                  <AdminAction action={deleteServiceCentreAction.bind(null, c.id)} label="Delete" tone="reject" />
                  <LocationPicker
                    id={c.id}
                    name={c.name}
                    address={c.address}
                    town={c.town}
                    initial={c.lat != null && c.lng != null ? { lat: c.lat, lng: c.lng } : null}
                  />
                </div>
              </div>
            ))}
          </div>
          <AddServiceCentreForm />
        </section>

        <section>
          <h2 className={sectionTitle}>All users ({allProfiles.length})</h2>
          <div className="overflow-x-auto rounded-[10px] border border-line">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-grey">
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Town</th>
                  <th className="px-3 py-2 font-medium">Phone</th>
                  <th className="px-3 py-2 font-medium">Account type</th>
                  <th className="px-3 py-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {allProfiles.map((p) => (
                  <tr key={p.id} className="border-b border-line/60">
                    <td className="px-3 py-2 text-ink">{p.name ?? "—"}</td>
                    <td className="px-3 py-2 text-ink-dim">{p.town ?? "—"}</td>
                    <td className="px-3 py-2 text-ink-dim">{p.phone ?? "—"}</td>
                    <td className="px-3 py-2 text-ink-dim">{p.account_type}</td>
                    <td className="px-3 py-2 text-ink-dim">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
