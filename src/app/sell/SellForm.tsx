"use client";

import { startTransition, useActionState, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { createListingAction, type CreateListingState } from "@/app/actions/listings";
import { RIDING_STYLES, ENGINE_TYPES, TOWNS, formatPrice } from "@/lib/constants/listings";
import { PinIcon } from "@/app/components/icons";
import PhotoPicker from "@/app/components/PhotoPicker";
import Badge from "@/app/components/Badge";
import Chip from "@/app/components/Chip";
import { uploadListingPhotos } from "@/app/components/uploadPhotos";
import { MAX_PHOTOS } from "@/lib/data/listingPhotos";
import { input as inputClass, label as labelClass, sectionTitle as sectionTitleClass, button } from "@/app/components/ui";

const initialState: CreateListingState = { error: null, listing: null };

type PreviewData = {
  make: string;
  model: string;
  price: number;
  cc: number;
  engineType: string;
  style: string;
  town: string;
};


function PreviewCard({ data, photoUrl }: { data: PreviewData; photoUrl?: string }) {
  const price = formatPrice(data.price || 0, "EUR");
  return (
    <div className="overflow-hidden rounded-[10px] border border-line bg-panel">
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
        <img src={photoUrl} alt="" className="aspect-[4/3] w-full object-cover" />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-[#26262b] to-[#18181b] text-[13px] text-grey">
          No photo yet
        </div>
      )}
      <div className="px-3 pt-2.5 pb-3">
        <div className="truncate text-sm font-bold text-ink">
          {data.make || "Make"} {data.model || "Model"}
        </div>
        <div className="mb-1.5 text-base font-extrabold text-gold-bright">
          {data.price ? price.main : "€0"}{" "}
          <span className="ml-1 text-[11px] font-normal text-grey">{data.price ? price.alt : ""}</span>
        </div>
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          <Chip>{data.cc || 0}cc</Chip>
          <Chip>{data.engineType}</Chip>
          <Chip>{data.style}</Chip>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-grey">
          <PinIcon />
          {data.town}
        </div>
      </div>
    </div>
  );
}

type Upload =
  | { status: "idle" }
  | { status: "uploading"; done: number; total: number }
  | { status: "done"; skipped: number }
  | { status: "failed" };

export default function SellForm({ profilePhone }: { profilePhone: string | null }) {
  const [state, formAction, pending] = useActionState(createListingAction, initialState);

  // Submitting through onSubmit rather than <form action> on purpose: React
  // resets a form after its action runs, which would wipe what the seller
  // typed whenever validation sends back an error.
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => formAction(data));
  }
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploadState, setUpload] = useState<Upload>({ status: "idle" });
  const coverUrl = useMemo(() => (photos[0] ? URL.createObjectURL(photos[0]) : undefined), [photos]);
  useEffect(() => () => { if (coverUrl) URL.revokeObjectURL(coverUrl); }, [coverUrl]);

  // Photos are stored under the listing's id, so they go up once the
  // listing exists — straight from the browser to Storage.
  const started = useRef(false);
  useEffect(() => {
    if (!state.listing || started.current || photos.length === 0) return;
    started.current = true;
    uploadListingPhotos(state.listing.id, photos, 0, (done, total) =>
      setUpload({ status: "uploading", done, total })
    )
      .then(({ skipped }) => setUpload({ status: "done", skipped }))
      .catch(() => setUpload({ status: "failed" }));
  }, [state.listing, photos]);
  const [preview, setPreview] = useState<PreviewData>({
    make: "",
    model: "",
    price: 0,
    cc: 0,
    engineType: "4-stroke",
    style: "Naked",
    town: "Skopje",
  });

  function update<K extends keyof PreviewData>(key: K, value: PreviewData[K]) {
    setPreview((p) => ({ ...p, [key]: value }));
  }

  // No photos picked: nothing to upload, so the listing is simply done.
  const upload: Upload =
    state.listing && photos.length === 0 ? { status: "done", skipped: 0 } : uploadState;

  if (state.listing && (upload.status === "idle" || upload.status === "uploading")) {
    return (
      <div className="mx-auto max-w-[520px] px-5 py-20 text-center">
        <h1 className="font-display mb-2.5 text-2xl">Uploading your photos…</h1>
        <p className="text-sm text-ink-dim">
          {upload.status === "uploading" ? `${upload.done} of ${upload.total} done` : "Starting"} —
          keep this page open.
        </p>
      </div>
    );
  }

  if (state.listing) {
    return (
      <div className="mx-auto max-w-[520px] px-5 py-14 text-center">
        <Badge tone="red" size="md" className="mb-4">
        Pending review
      </Badge>
        <h1 className="font-display mb-2.5 text-3xl">Your listing has been submitted</h1>
        <p className="mb-5 text-sm text-ink-dim">
          <strong className="text-ink">{state.listing.title}</strong> won&rsquo;t be visible to
          buyers until an admin approves it — we&rsquo;ll keep it out of search until then.
        </p>
        {upload.status === "failed" && (
          <p className="mb-5 rounded-md bg-red/20 px-3 py-2 text-sm text-gold-bright">
            Your listing was saved, but the photos didn&rsquo;t upload. Add them from My Garage.
          </p>
        )}
        {upload.status === "done" && upload.skipped > 0 && (
          <p className="mb-5 rounded-md bg-red/20 px-3 py-2 text-sm text-gold-bright">
            {upload.skipped} photo{upload.skipped > 1 ? "s" : ""} couldn&rsquo;t be read (try JPEG or PNG) — add
            {upload.skipped > 1 ? " them" : " it"} again from My Garage.
          </p>
        )}
        <div className="mx-auto mb-6 max-w-[300px] text-left">
          <PreviewCard data={preview} photoUrl={coverUrl} />
        </div>
        <Link
          href="/garage"
          className={button("primary", "lg")}
        >
          Go to My Garage
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-[1100px] grid-cols-1 gap-8 px-5 py-8 md:grid-cols-[1fr_300px]">
      <div>
        {state.error && (
          <p className="mb-4 rounded-md bg-red/20 px-3 py-2 text-sm text-gold-bright">{state.error}</p>
        )}

        <div className="mb-7">
          <h2 className={sectionTitleClass}>The bike</h2>
          <div className="mb-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <label className={labelClass}>
              Make <span className="text-red">*</span>
              <input
                name="make"
                required
                placeholder="e.g. Yamaha"
                className={inputClass}
                onChange={(e) => update("make", e.target.value)}
              />
            </label>
            <label className={labelClass}>
              Model <span className="text-red">*</span>
              <input
                name="model"
                required
                placeholder="e.g. MT-07"
                className={inputClass}
                onChange={(e) => update("model", e.target.value)}
              />
            </label>
          </div>
          <div className="mb-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <label className={labelClass}>
              Year
              <input name="year" type="number" min="1970" max={new Date().getFullYear() + 1} placeholder="2020" className={inputClass} />
            </label>
            <label className={labelClass}>
              Engine size (cc)
              <input
                name="engine_cc"
                type="number"
                min="0"
                placeholder="650"
                className={inputClass}
                onChange={(e) => update("cc", Number(e.target.value))}
              />
            </label>
          </div>
          <div className="mb-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <label className={labelClass}>
              Engine type
              <select
                name="engine_type"
                defaultValue="4-stroke"
                className={inputClass}
                onChange={(e) => update("engineType", e.target.value)}
              >
                {ENGINE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Riding style
              <select
                name="riding_style"
                defaultValue="Naked"
                className={inputClass}
                onChange={(e) => update("style", e.target.value)}
              >
                {RIDING_STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className={`${labelClass} mb-3.5`}>
            Mileage (km)
            <input name="mileage_km" type="number" min="0" placeholder="14200" className={inputClass} />
          </label>
          <label className={labelClass}>
            Description
            <textarea
              name="description"
              rows={5}
              maxLength={3000}
              placeholder="Condition, service history, extras, reason for selling…"
              className={`${inputClass} normal-case`}
            />
          </label>
        </div>

        <div className="mb-7">
          <h2 className={sectionTitleClass}>Price &amp; location</h2>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <label className={labelClass}>
              Price (€) <span className="text-red">*</span>
              <input
                name="price_eur"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="6400"
                className={inputClass}
                onChange={(e) => update("price", Number(e.target.value))}
              />
            </label>
            <label className={labelClass}>
              Town
              <select
                name="town"
                defaultValue="Skopje"
                className={inputClass}
                onChange={(e) => update("town", e.target.value)}
              >
                {TOWNS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mb-7">
          <h2 className={sectionTitleClass}>Contact</h2>
          <label className={labelClass}>
            Phone (WhatsApp) <span className="text-red">*</span>
            <input
              name="phone"
              type="tel"
              required
              defaultValue={profilePhone ?? ""}
              placeholder="070 123 456"
              className={inputClass}
            />
          </label>
          <p className="mt-1.5 text-xs text-grey">
            Only shown to signed-in buyers. Saved to your profile for next time.
          </p>
        </div>

        <div className="mb-7">
          <h2 className={sectionTitleClass}>Photos</h2>
          <PhotoPicker files={photos} onChange={setPhotos} max={MAX_PHOTOS} />
        </div>

        <button
          type="submit"
          disabled={pending}
          className={`${button("primary", "lg")} w-full py-3.5`}
        >
          {pending ? "Submitting…" : "List my bike"}
        </button>
      </div>

      <div className="self-start md:sticky md:top-24">
        <div className="mb-2.5 text-xs tracking-wide text-ink-dim uppercase">Live preview</div>
        <PreviewCard data={preview} photoUrl={coverUrl} />
      </div>
    </form>
  );
}
