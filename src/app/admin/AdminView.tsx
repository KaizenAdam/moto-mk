import type { ReactNode } from "react";
import type { Tables } from "@/lib/database.types";
import {
  approveListingAction,
  rejectListingAction,
  approveDealerRequestAction,
  rejectDealerRequestAction,
  deleteEventAction,
  deleteServiceCentreAction,
  setServiceCentreVerifiedAction,
} from "@/app/actions/admin";
import Badge from "@/app/components/Badge";
import Chip from "@/app/components/Chip";
import EventDate from "@/app/components/EventDate";
import { PinIcon } from "@/app/components/icons";
import { card, heroBackground } from "@/app/components/ui";
import AddEventForm from "./AddEventForm";
import AdminAction from "./AdminAction";
import AddServiceCentreForm from "./AddServiceCentreForm";
import LocationPicker from "./LocationPicker";
import LocateAll from "./LocateAll";
import UsersTable from "./UsersTable";

export type PendingListing = { listing: Tables<"listings">; sellerName: string | null; coverUrl?: string };
export type PendingRequest = { request: Tables<"dealer_requests">; requesterName: string | null };
export type DealerRow = { profile: Tables<"profiles">; businessName: string | null; slug: string | null };

/**
 * The admin portal, laid out as a dashboard: counts across the top (each
 * jumps to its section), a section rail on wide screens, then the review
 * queues and the things admins manage. Markup only; page.tsx fetches and
 * gates. The actions are the same as ever, and RLS — not this page — is
 * what stops a non-admin.
 */
export default function AdminView({
  pendingListings,
  pendingRequests,
  dealers,
  events,
  serviceCentres,
  profiles,
}: {
  pendingListings: PendingListing[];
  pendingRequests: PendingRequest[];
  dealers: DealerRow[];
  events: Tables<"events">[];
  serviceCentres: Tables<"service_centres">[];
  profiles: Tables<"profiles">[];
}) {
  const onMap = serviceCentres.filter((c) => c.lat != null).length;
  const verified = serviceCentres.filter((c) => c.verified).length;

  const sections = [
    { id: "listings", label: "Pending listings", count: pendingListings.length, attention: pendingListings.length > 0 },
    { id: "requests", label: "Dealer requests", count: pendingRequests.length, attention: pendingRequests.length > 0 },
    { id: "dealers", label: "Dealers", count: dealers.length },
    { id: "events", label: "Events", count: events.length },
    { id: "centres", label: "Service centres", count: serviceCentres.length },
    { id: "users", label: "Users", count: profiles.length },
  ];

  return (
    <main className="pb-16">
      <section className="border-b border-line px-5 py-8" style={{ background: heroBackground }}>
        <div className="mx-auto max-w-[1280px]">
          <h1 className="font-display text-3xl sm:text-4xl">Admin</h1>
          <p className="mt-1 text-sm text-ink-dim">Review what&rsquo;s waiting, and manage events, service centres and users.</p>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-4 pt-8 sm:px-5">
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`${card} p-4 transition hover:border-gold ${s.attention ? "border-gold/60" : ""}`}
            >
              <p className={`font-display text-3xl ${s.attention ? "text-gold-bright" : "text-ink"}`}>{s.count}</p>
              <p className="mt-1 text-xs tracking-wide text-ink-dim uppercase">{s.label}</p>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[200px_minmax(0,1fr)]">
          <nav className="hidden lg:block" aria-label="Admin sections">
            <ul className="sticky top-24 space-y-1 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="flex items-center justify-between rounded-md px-3 py-2 text-ink-dim hover:bg-panel2 hover:text-gold-bright">
                    {s.label}
                    {s.attention && <Badge tone="gold">{s.count}</Badge>}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-12">
            <Section id="listings" title={`Pending listings (${pendingListings.length})`}>
              {pendingListings.length === 0 && <Nothing>Nothing waiting on review.</Nothing>}
              <div className="space-y-3">
                {pendingListings.map(({ listing, sellerName, coverUrl }) => (
                  <div key={listing.id} className={`${card} flex flex-col gap-4 p-4 sm:flex-row`}>
                    <a href={`/listings/${listing.id}`} className="shrink-0" title="Open listing">
                      {coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- signed URL rotates per request
                        <img src={coverUrl} alt="" className="aspect-[4/3] w-full rounded-md object-cover sm:w-44" />
                      ) : (
                        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-md bg-panel2 text-xs text-grey sm:w-44">
                          No photo
                        </div>
                      )}
                    </a>
                    <div className="min-w-0 flex-1 text-sm">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <a href={`/listings/${listing.id}`} className="font-display text-xl text-ink hover:text-gold-bright">
                          {listing.title}
                        </a>
                        <span className="font-display text-xl text-gold-bright">
                          €{Number(listing.price_eur).toLocaleString("en-GB")}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {listing.engine_cc != null && <Chip>{listing.engine_cc}cc</Chip>}
                        {listing.engine_type && <Chip>{listing.engine_type}</Chip>}
                        {listing.riding_style && <Chip>{listing.riding_style}</Chip>}
                        {listing.mileage_km != null && <Chip>{listing.mileage_km.toLocaleString("en-GB")} km</Chip>}
                        {listing.town && <Chip>{listing.town}</Chip>}
                      </div>
                      {listing.description && <p className="mt-2 line-clamp-2 text-ink-dim">{listing.description}</p>}
                      <p className="mt-2 text-xs text-grey">
                        Seller: {sellerName ?? "—"} · submitted {new Date(listing.created_at).toLocaleDateString("en-GB")}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <AdminAction action={approveListingAction.bind(null, listing.id)} label="Approve" tone="approve" />
                        <AdminAction action={rejectListingAction.bind(null, listing.id)} label="Reject" tone="reject" withReason />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="requests" title={`Dealer requests (${pendingRequests.length})`}>
              {pendingRequests.length === 0 && <Nothing>Nothing waiting on review.</Nothing>}
              <div className="grid gap-3 md:grid-cols-2">
                {pendingRequests.map(({ request, requesterName }) => (
                  <div key={request.id} className={`${card} p-4 text-sm`}>
                    <p className="font-display text-lg text-ink">{request.business_name}</p>
                    <p className="mt-1 text-ink-dim">
                      {request.address ?? "No address"} · {request.phone ?? "No phone"}
                    </p>
                    <p className="text-xs text-grey">Requested by {requesterName ?? "—"}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <AdminAction action={approveDealerRequestAction.bind(null, request.id)} label="Approve" tone="approve" />
                      <AdminAction action={rejectDealerRequestAction.bind(null, request.id)} label="Reject" tone="reject" />
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="dealers" title={`Dealers (${dealers.length})`}>
              {dealers.length === 0 && <Nothing>No approved dealers yet.</Nothing>}
              <div className="grid gap-3 md:grid-cols-2">
                {dealers.map(({ profile, businessName, slug }) => (
                  <div key={profile.id} className={`${card} flex items-center gap-3 p-4 text-sm`}>
                    <span className="font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-panel2 text-lg text-gold">
                      {(businessName ?? profile.name ?? "?").charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-ink">{businessName ?? "—"}</p>
                      <p className="truncate text-xs text-grey">
                        {profile.name ?? "—"} · {profile.town ?? "—"} · {profile.phone ?? "no phone"}
                      </p>
                    </div>
                    {slug && (
                      <a href={`/dealers/${slug}`} className="shrink-0 text-xs text-gold-bright hover:underline">
                        Storefront →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </Section>

            <Section id="events" title={`Events (${events.length})`}>
              {events.length === 0 && <Nothing>No events yet — add the first below.</Nothing>}
              <div className="space-y-2">
                {events.map((event) => (
                  <div key={event.id} className={`${card} flex gap-3 p-3 text-sm`}>
                    <EventDate date={event.event_date} />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg text-ink">{event.title}</p>
                      {event.location && (
                        <p className="flex items-center gap-1 text-xs text-grey">
                          <PinIcon />
                          {event.location}
                        </p>
                      )}
                      {event.description && <p className="mt-1 line-clamp-2 text-ink-dim">{event.description}</p>}
                    </div>
                    <div className="shrink-0">
                      <AdminAction action={deleteEventAction.bind(null, event.id)} label="Delete" tone="reject" />
                    </div>
                  </div>
                ))}
              </div>
              <AddEventForm />
            </Section>

            <Section id="centres" title={`Service centres (${serviceCentres.length})`}>
              <p className="mb-3 text-xs text-grey">
                {verified} verified · {onMap} on the map. Unverified entries show a &ldquo;call ahead to
                confirm&rdquo; note on the public page — mark one verified once you&rsquo;ve confirmed it by
                phone or visit.
              </p>
              <LocateAll
                centres={serviceCentres
                  .filter((c) => c.lat == null)
                  .map((c) => ({ id: c.id, name: c.name, address: c.address, town: c.town }))}
              />
              <div className="space-y-2">
                {serviceCentres.map((c) => (
                  <div key={c.id} className={`${card} p-3 text-sm`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-lg text-ink">{c.name}</p>
                      <Badge tone={c.verified ? "green" : "muted"}>{c.verified ? "Verified" : "Unverified"}</Badge>
                      <Badge tone={c.lat != null ? "green" : "soft"}>{c.lat != null ? "On map" : "Not on map"}</Badge>
                    </div>
                    <p className="mt-1 text-ink-dim">
                      {c.town} · {c.address ?? "no address"} · {c.phone ?? "no phone"}
                      {c.source_url && (
                        <>
                          {" · "}
                          <a href={c.source_url} target="_blank" rel="noopener noreferrer" className="text-gold-bright hover:underline">
                            source
                          </a>
                        </>
                      )}
                    </p>
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
            </Section>

            <Section id="users" title={`Users (${profiles.length})`}>
              <UsersTable profiles={profiles} />
            </Section>
          </div>
        </div>
      </div>
    </main>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display mb-4 border-b border-line pb-2.5 text-xl font-semibold tracking-wide text-gold">{title}</h2>
      {children}
    </section>
  );
}

function Nothing({ children }: { children: ReactNode }) {
  return <p className="rounded-[10px] border border-dashed border-line px-4 py-6 text-center text-sm text-ink-dim">{children}</p>;
}
