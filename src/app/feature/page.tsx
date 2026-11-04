import Link from "next/link";
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/format";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/auth";
import { listOwn } from "@/lib/data/listings";
import { getCoverPhotos } from "@/lib/data/listingPhotos";
import { cachedPhotoSigner } from "@/lib/photos/signer";
import { formatPrice } from "@/lib/constants/listings";
import { ArrowLeftIcon } from "@/app/components/icons";
import EmptyState from "@/app/components/EmptyState";
import { BlockHero, HighlightWord } from "@/app/components/Bands";
import { button } from "@/app/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.featurePickerTitle, robots: { index: false } };
}

/**
 * "Feature a bike" from the account menu. Featuring is per listing, so:
 * one live bike goes straight to its package picker, several get a choice,
 * none explains why (only live bikes can be featured).
 */
export default async function FeatureABikePage() {
  const supabase = await createClient();
  const [user, { locale, t }] = await Promise.all([getCurrentUser(supabase), getI18n()]);
  if (!user) redirect("/login");
  const P = t.feature;

  const mine = await listOwn(supabase);
  const live = mine.filter((l) => l.status === "active");
  if (live.length === 1) redirect(`/listings/${live[0].id}/feature`);

  const covers = await getCoverPhotos(
    supabase,
    live.map((l) => l.id),
    cachedPhotoSigner(supabase),
  );
  const waiting = mine.filter((l) => l.status === "pending").length;

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
          className: "top-0 right-[-80px] h-full w-[380px] bg-highlight/[.10] sm:right-[-20px]",
        }}
        title={
          <>
            {P.pickerTitle1}
            <br />
            <HighlightWord>{P.pickerTitle2}</HighlightWord>
          </>
        }
        intro={P.pickerIntro}
      />

      <div className="mx-auto max-w-[1100px] px-5 pt-10">
        {live.length === 0 ? (
          <EmptyState>
            <p className="mb-4">
              {P.onlyLiveShort} {waiting > 0 ? fill(P.waiting, { n: waiting }) : P.noneOnSale}
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              <Link href="/sell" className={button("primary", "md")}>
                {t.garage.sellButton}
              </Link>
              <Link href="/garage" className={button("outline", "md")}>
                {t.common.myGarage}
              </Link>
            </div>
          </EmptyState>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((l) => {
              const cover = covers.get(l.id)?.url;
              return (
                <div key={l.id} className="flex flex-col border border-line bg-panel">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element -- signed URL
                    <img src={cover} alt="" className="aspect-[4/3] w-full object-cover" />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-panel2 text-xs text-grey">
                      {t.garage.noPhoto}
                    </div>
                  )}
                  <div className="flex flex-1 flex-col px-4 pt-3.5 pb-4">
                    <p className="font-display text-[19px] leading-tight">{l.title}</p>
                    <p className="mt-2">
                      <span className="font-display bg-highlight px-2.5 py-0.5 text-lg text-[#111]">
                        {formatPrice(Number(l.price_eur), "EUR", locale).main}
                      </span>
                    </p>
                    <Link href={`/listings/${l.id}/feature`} className={`${button("primary", "md")} mt-4`}>
                      {P.featureThis}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
