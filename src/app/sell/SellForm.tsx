"use client";

import { startTransition, useActionState, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { createListingAction, type CreateListingState } from "@/app/actions/listings";
import { RIDING_STYLES, ENGINE_TYPES, TOWNS, formatPrice } from "@/lib/constants/listings";
import { PinIcon, ArrowLeftIcon } from "@/app/components/icons";
import PhotoPicker from "@/app/components/PhotoPicker";
import Badge from "@/app/components/Badge";
import Chip from "@/app/components/Chip";
import { uploadListingPhotos } from "@/app/components/uploadPhotos";
import { MAX_PHOTOS } from "@/lib/data/listingPhotos";
import {
  input as inputClass,
  label as labelClass,
  sectionTitle as sectionTitleClass,
  button,
} from "@/app/components/ui";
import { useI18n } from "@/app/components/I18nProvider";
import { fill, plural } from "@/lib/i18n/format";

const initialState: CreateListingState = { error: null, listing: null };

/** Four steps; their titles and hints are the dictionary's `sell.steps`. */
const STEP_COUNT = 4;

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
  const { locale, t } = useI18n();
  const price = formatPrice(data.price || 0, "EUR", locale);
  return (
    <div className="overflow-hidden border border-line bg-panel">
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
        <img src={photoUrl} alt="" className="aspect-[4/3] w-full object-cover" />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-[#26262b] to-[#18181b] text-[13px] text-grey">
          {t.common.noPhotoYet}
        </div>
      )}
      <div className="px-3 pt-2.5 pb-3">
        <div className="truncate text-sm font-bold text-ink">
          {data.make || t.sell.previewMake} {data.model || t.sell.previewModel}
        </div>
        <div className="mb-1.5 text-base font-extrabold text-highlight">
          {data.price ? price.main : "€0"}{" "}
          <span className="ml-1 text-[11px] font-normal text-grey">{data.price ? price.alt : ""}</span>
        </div>
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          <Chip>{data.cc || 0}cc</Chip>
          <Chip>{t.engineTypes[data.engineType] ?? data.engineType}</Chip>
          <Chip>{t.styles[data.style] ?? data.style}</Chip>
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
  const { locale, t } = useI18n();
  const S = t.sell;
  const F = t.bikeForm;

  const formRef = useRef<HTMLFormElement>(null);
  const [stepIndex, setStepIndex] = useState(0);
  // Furthest step reached, so the step bar can jump back but not skip ahead.
  const [reached, setReached] = useState(0);

  /** First invalid field in a step (browser validation: required, min/max…), if any. */
  function firstInvalid(i: number) {
    const fields = formRef.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      `[data-step="${i}"] input, [data-step="${i}"] select, [data-step="${i}"] textarea`,
    );
    return [...(fields ?? [])].find((f) => !f.checkValidity()) ?? null;
  }

  function goTo(i: number) {
    setStepIndex(i);
    setReached((r) => Math.max(r, i));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Submitting through onSubmit rather than <form action> on purpose: React
  // resets a form after its action runs, which would wipe what the seller
  // typed whenever validation sends back an error. Enter or "Next" on an
  // earlier step just moves on (after checking that step's fields).
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (stepIndex < STEP_COUNT - 1) {
      const bad = firstInvalid(stepIndex);
      if (bad) bad.reportValidity();
      else goTo(stepIndex + 1);
      return;
    }
    // Last step: every step must be valid (the form is noValidate, so the
    // browser won't stop on a hidden step's field by itself).
    for (let i = 0; i < STEP_COUNT; i++) {
      const bad = firstInvalid(i);
      if (bad) {
        setStepIndex(i);
        requestAnimationFrame(() => bad.reportValidity());
        return;
      }
    }
    const data = new FormData(form);
    startTransition(() => formAction(data));
  }
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploadState, setUpload] = useState<Upload>({ status: "idle" });
  const coverUrl = useMemo(() => (photos[0] ? URL.createObjectURL(photos[0]) : undefined), [photos]);
  useEffect(
    () => () => {
      if (coverUrl) URL.revokeObjectURL(coverUrl);
    },
    [coverUrl],
  );

  // Photos are stored under the listing's id, so they go up once the
  // listing exists — straight from the browser to Storage.
  const started = useRef(false);
  useEffect(() => {
    if (!state.listing || started.current || photos.length === 0) return;
    started.current = true;
    uploadListingPhotos(state.listing.id, photos, 0, (done, total) => setUpload({ status: "uploading", done, total }))
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
  const upload: Upload = state.listing && photos.length === 0 ? { status: "done", skipped: 0 } : uploadState;

  if (state.listing && (upload.status === "idle" || upload.status === "uploading")) {
    return (
      <div className="mx-auto max-w-[520px] px-5 py-20 text-center">
        <h1 className="font-display mb-2.5 text-2xl">{S.uploading}</h1>
        <p className="text-sm text-ink-dim">
          {upload.status === "uploading"
            ? fill(S.uploadProgress, { done: upload.done, total: upload.total })
            : S.starting}
          {S.keepOpen}
        </p>
      </div>
    );
  }

  if (state.listing) {
    return (
      <div className="mx-auto max-w-[520px] px-5 py-14 text-center">
        <Badge tone="red" size="md" className="mb-4">
          {S.pendingReview}
        </Badge>
        <h1 className="font-display mb-2.5 text-3xl">{S.submitted}</h1>
        <p className="mb-5 text-sm text-ink-dim">{fill(S.notVisible, { title: state.listing.title })}</p>
        {upload.status === "failed" && (
          <p className="mb-5 border-l-4 border-red bg-red/15 px-3 py-2 text-sm text-ink">{S.photosFailed}</p>
        )}
        {upload.status === "done" && upload.skipped > 0 && (
          <p className="mb-5 border-l-4 border-red bg-red/15 px-3 py-2 text-sm text-ink">
            {plural(locale, upload.skipped, S.photosSkipped)}
          </p>
        )}
        <div className="mx-auto mb-6 max-w-[300px] text-left">
          <PreviewCard data={preview} photoUrl={coverUrl} />
        </div>
        <Link href="/garage" className={button("primary", "lg")}>
          {S.goToGarage}
        </Link>
      </div>
    );
  }

  const step = S.steps[stepIndex];
  const isLast = stepIndex === STEP_COUNT - 1;

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      noValidate
      className="mx-auto grid max-w-[1100px] grid-cols-1 gap-8 px-5 py-8 md:grid-cols-[1fr_300px]"
    >
      <div>
        <ol className="mb-8 grid grid-cols-4 gap-2" aria-label={S.stepsLabel}>
          {S.steps.map((s, i) => {
            const done = i < stepIndex;
            const current = i === stepIndex;
            return (
              <li key={s.title}>
                <button
                  type="button"
                  disabled={i > reached}
                  onClick={() => goTo(i)}
                  aria-current={current ? "step" : undefined}
                  className="group w-full text-left disabled:cursor-not-allowed"
                >
                  <span className={`block h-1.5 ${current || done ? "bg-highlight" : "bg-line"}`} />
                  <span
                    className={`font-display mt-2 block text-xs tracking-wider sm:text-sm ${
                      current ? "text-highlight" : done ? "text-ink group-hover:text-highlight" : "text-grey"
                    }`}
                  >
                    <span className="hidden sm:inline">{i + 1}. </span>
                    {s.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {state.error && (
          <p className="mb-4 border-l-4 border-red bg-red/15 px-3 py-2 text-sm text-ink">{state.error}</p>
        )}

        {/* Every step stays mounted so one FormData carries all the fields to
            createListingAction; only the current one is shown. */}
        <section data-step="0" hidden={stepIndex !== 0}>
          <h2 className={sectionTitleClass}>{S.theBike}</h2>
          <div className="mb-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <label className={labelClass}>
              {F.make} <span className="text-red">*</span>
              <input
                name="make"
                required
                placeholder={F.makePlaceholder}
                className={inputClass}
                onChange={(e) => update("make", e.target.value)}
              />
            </label>
            <label className={labelClass}>
              {F.model} <span className="text-red">*</span>
              <input
                name="model"
                required
                placeholder={F.modelPlaceholder}
                className={inputClass}
                onChange={(e) => update("model", e.target.value)}
              />
            </label>
          </div>
          <div className="mb-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <label className={labelClass}>
              {F.year}
              <input
                name="year"
                type="number"
                min="1970"
                max={new Date().getFullYear() + 1}
                placeholder="2020"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              {F.engineSize}
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
              {F.engineType}
              <select
                name="engine_type"
                defaultValue="4-stroke"
                className={inputClass}
                onChange={(e) => update("engineType", e.target.value)}
              >
                {ENGINE_TYPES.map((e) => (
                  <option key={e.value} value={e.value}>
                    {t.engineTypes[e.value] ?? e.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              {F.style}
              <select
                name="riding_style"
                defaultValue="Naked"
                className={inputClass}
                onChange={(e) => update("style", e.target.value)}
              >
                {RIDING_STYLES.map((s) => (
                  <option key={s} value={s}>
                    {t.styles[s] ?? s}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className={`${labelClass} mb-3.5`}>
            {F.mileage}
            <input name="mileage_km" type="number" min="0" placeholder="14200" className={inputClass} />
          </label>
          <label className={labelClass}>
            {F.description}
            <textarea
              name="description"
              rows={5}
              maxLength={3000}
              placeholder={F.descriptionPlaceholder}
              className={`${inputClass} normal-case`}
            />
          </label>
        </section>

        <section data-step="1" hidden={stepIndex !== 1}>
          <h2 className={sectionTitleClass}>{S.photos}</h2>
          <p className="mb-4 text-sm text-ink-dim">{S.photosHint}</p>
          <PhotoPicker files={photos} onChange={setPhotos} max={MAX_PHOTOS} />
        </section>

        <section data-step="2" hidden={stepIndex !== 2}>
          <h2 className={sectionTitleClass}>{S.priceLocation}</h2>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <label className={labelClass}>
              {F.price} <span className="text-red">*</span>
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
              {F.town}
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
        </section>

        <section data-step="3" hidden={stepIndex !== 3}>
          <h2 className={sectionTitleClass}>{S.contactTitle}</h2>
          <label className={labelClass}>
            {F.phone} <span className="text-red">*</span>
            <input
              name="phone"
              type="tel"
              required
              defaultValue={profilePhone ?? ""}
              placeholder="070 123 456"
              className={inputClass}
            />
          </label>
          <p className="mt-1.5 text-xs text-grey">{S.phoneHint}</p>

          <h2 className={`${sectionTitleClass} mt-8`}>{S.checkOver}</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-grey">{S.bike}</dt>
            <dd className="text-ink">{[preview.make, preview.model].filter(Boolean).join(" ") || "-"}</dd>
            <dt className="text-grey">{S.price}</dt>
            <dd className="text-ink">{preview.price ? formatPrice(preview.price, "EUR", locale).main : "-"}</dd>
            <dt className="text-grey">{S.town}</dt>
            <dd className="text-ink">{preview.town}</dd>
            <dt className="text-grey">{S.photosCount}</dt>
            <dd className="text-ink">{photos.length === 0 ? S.noPhotos : photos.length}</dd>
          </dl>
          <p className="mt-4 text-xs text-grey">{S.moderatorNote}</p>
        </section>

        <div className="mt-8 flex gap-3">
          {stepIndex > 0 && (
            <button type="button" onClick={() => goTo(stepIndex - 1)} className={button("outline", "lg")}>
              <ArrowLeftIcon />
              {S.back}
            </button>
          )}
          <button type="submit" disabled={pending} className={`${button("primary", "lg")} flex-1 py-3.5`}>
            {isLast
              ? pending
                ? S.submitting
                : S.listMyBike
              : fill(S.nextStep, { step: S.steps[stepIndex + 1].title })}
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-grey">
          {fill(S.stepOf, { n: stepIndex + 1, total: STEP_COUNT, hint: step.hint })}
        </p>
      </div>

      <div className="self-start md:sticky md:top-24">
        <div className="mb-2.5 text-xs tracking-wide text-ink-dim uppercase">{S.livePreview}</div>
        <PreviewCard data={preview} photoUrl={coverUrl} />
      </div>
    </form>
  );
}
