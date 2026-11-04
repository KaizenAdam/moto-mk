import Link from "next/link";
import type { Metadata } from "next";
import { BlockHero, HighlightWord } from "@/app/components/Bands";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/auth";
import { getById } from "@/lib/data/listings";
import { listForListing, MAX_PHOTOS } from "@/lib/data/listingPhotos";
import EditListingForm from "./EditListingForm";
import PhotoManager from "./PhotoManager";
import { sectionTitle } from "@/app/components/ui";
import { ArrowLeftIcon } from "@/app/components/icons";
import { getI18n } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/format";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.editTitle, robots: { index: false } };
}

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [user, listing, { t }] = await Promise.all([getCurrentUser(supabase), getById(supabase, id), getI18n()]);

  if (!user) redirect("/login");
  // RLS would block the writes anyway; this just avoids showing a form that can't save.
  if (!listing || listing.seller_id !== user.id) notFound();

  const photos = await listForListing(supabase, listing.id);

  return (
    <main className="pb-16">
      <BlockHero
        compact
        above={
          <Link href="/garage" className="inline-flex items-center gap-1.5 text-sm text-[#bdbab2] hover:text-highlight">
            <ArrowLeftIcon />
            {t.common.myGarage}
          </Link>
        }
        shard={{
          shape: "double",
          className:
            "top-[-30%] right-[-170px] h-[150%] w-[480px] -scale-x-100 rotate-[14deg] bg-red/[.18] sm:right-[2%]",
        }}
        title={
          <>
            {t.edit.editYour}
            <br />
            <HighlightWord>{listing.make}</HighlightWord>
          </>
        }
        intro={listing.title}
      />

      <div className="mx-auto max-w-3xl px-5 pt-10">
        {listing.status === "active" && (
          <p className="mb-8 border-l-4 border-highlight bg-panel px-4 py-3 text-sm text-ink-dim">{t.edit.liveNote}</p>
        )}
        {listing.status === "rejected" && listing.rejection_reason && (
          <p className="mb-8 border-l-4 border-red bg-red/15 px-4 py-3 text-sm text-ink">
            {fill(t.edit.rejected, { reason: listing.rejection_reason })}
          </p>
        )}

        <section className="mb-10">
          <h2 className={sectionTitle}>{t.edit.details}</h2>
          <EditListingForm listing={listing} />
        </section>

        <section>
          <h2 className={sectionTitle}>{fill(t.edit.photos, { n: photos.length, max: MAX_PHOTOS })}</h2>
          <PhotoManager listingId={listing.id} photos={photos} max={MAX_PHOTOS} />
        </section>
      </div>
    </main>
  );
}
