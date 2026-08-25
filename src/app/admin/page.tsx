import { createClient } from "@/lib/supabase/server";
import { getOwnProfile, getPublicProfile } from "@/lib/data/profiles";
import { listPendingForAdmin as listPendingListings } from "@/lib/data/listings";
import { listPendingForAdmin as listPendingDealerRequests } from "@/lib/data/dealerRequests";
import {
  approveListingAction,
  rejectListingAction,
  approveDealerRequestAction,
  rejectDealerRequestAction,
} from "@/app/actions/admin";

export default async function AdminPage() {
  const supabase = await createClient();
  const profile = await getOwnProfile(supabase);

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>
          You need to{" "}
          <a href="/login" className="text-amber-400 hover:underline">
            log in
          </a>{" "}
          to view this page.
        </p>
      </main>
    );
  }

  if (profile.account_type !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-zinc-400">Not authorised — this page is admin-only.</p>
      </main>
    );
  }

  const [pendingListings, pendingRequests] = await Promise.all([
    listPendingListings(supabase),
    listPendingDealerRequests(supabase),
  ]);

  const sellers = await Promise.all(
    pendingListings.map((l) => getPublicProfile(supabase, l.seller_id))
  );
  const requesters = await Promise.all(
    pendingRequests.map((r) => getPublicProfile(supabase, r.profile_id))
  );

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl space-y-10">
        <h1 className="text-2xl font-bold text-amber-400">Admin review</h1>

        <section>
          <h2 className="mb-3 text-lg font-semibold">
            Pending listings ({pendingListings.length})
          </h2>
          {pendingListings.length === 0 && (
            <p className="text-sm text-zinc-500">Nothing waiting on review.</p>
          )}
          <div className="space-y-3">
            {pendingListings.map((listing, i) => (
              <div key={listing.id} className="rounded border border-zinc-800 bg-zinc-950 p-4 text-sm">
                <p className="font-semibold text-white">
                  {listing.make} {listing.model} — {listing.title}
                </p>
                <p className="text-zinc-400">
                  {listing.year ?? "—"} · {listing.engine_cc ?? "—"}cc ·{" "}
                  {listing.engine_type ?? "—"} · {listing.riding_style ?? "—"} · €
                  {Number(listing.price_eur).toLocaleString()} · {listing.town ?? "—"}
                </p>
                <p className="text-zinc-500">Seller: {sellers[i]?.name ?? "—"}</p>
                <div className="mt-3 flex gap-2">
                  <form action={approveListingAction.bind(null, listing.id)}>
                    <button className="rounded bg-green-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600">
                      Approve
                    </button>
                  </form>
                  <form action={rejectListingAction.bind(null, listing.id)}>
                    <button className="rounded bg-red-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-800">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">
            Pending dealer requests ({pendingRequests.length})
          </h2>
          {pendingRequests.length === 0 && (
            <p className="text-sm text-zinc-500">Nothing waiting on review.</p>
          )}
          <div className="space-y-3">
            {pendingRequests.map((req, i) => (
              <div key={req.id} className="rounded border border-zinc-800 bg-zinc-950 p-4 text-sm">
                <p className="font-semibold text-white">{req.business_name}</p>
                <p className="text-zinc-400">
                  {req.address ?? "—"} · {req.phone ?? "—"}
                </p>
                <p className="text-zinc-500">Requested by: {requesters[i]?.name ?? "—"}</p>
                <div className="mt-3 flex gap-2">
                  <form action={approveDealerRequestAction.bind(null, req.id)}>
                    <button className="rounded bg-green-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600">
                      Approve
                    </button>
                  </form>
                  <form action={rejectDealerRequestAction.bind(null, req.id)}>
                    <button className="rounded bg-red-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-800">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
