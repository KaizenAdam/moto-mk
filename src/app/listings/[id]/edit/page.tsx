import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/auth";
import { getById } from "@/lib/data/listings";
import { listForListing, MAX_PHOTOS } from "@/lib/data/listingPhotos";
import EditListingForm from "./EditListingForm";
import PhotoManager from "./PhotoManager";
import { sectionTitle } from "@/app/components/ui";


export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [user, listing] = await Promise.all([getCurrentUser(supabase), getById(supabase, id)]);

  if (!user) redirect("/login");
  // RLS would block the writes anyway; this just avoids showing a form that can't save.
  if (!listing || listing.seller_id !== user.id) notFound();

  const photos = await listForListing(supabase, listing.id);

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 pb-16">
      <Link href="/garage" className="mb-4 inline-block text-sm text-grey hover:text-gold-bright">
        ← My Garage
      </Link>
      <h1 className="font-display mb-1.5 text-2xl">Edit {listing.title}</h1>
      {listing.status === "active" && (
        <p className="mb-6 text-sm text-ink-dim">
          This listing is live. Price changes show straight away; any other change (including
          photos) sends it back for a quick review first.
        </p>
      )}
      {listing.status === "rejected" && listing.rejection_reason && (
        <p className="mb-6 rounded-md bg-red/20 px-3 py-2 text-sm text-gold-bright">
          Rejected: {listing.rejection_reason}. Fix it below and save to resubmit.
        </p>
      )}

      <section className="mb-10">
        <h2 className={sectionTitle}>Details</h2>
        <EditListingForm listing={listing} />
      </section>

      <section>
        <h2 className={sectionTitle}>Photos ({photos.length}/{MAX_PHOTOS})</h2>
        <PhotoManager listingId={listing.id} photos={photos} max={MAX_PHOTOS} />
      </section>
    </main>
  );
}
