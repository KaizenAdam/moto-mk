"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { removePhotoAction } from "@/app/actions/garage";
import ActionButton from "@/app/components/ActionButton";
import PhotoPicker from "@/app/components/PhotoPicker";
import { uploadListingPhotos } from "@/app/components/uploadPhotos";
import { useI18n } from "@/app/components/I18nProvider";
import { fill, plural } from "@/lib/i18n/format";
import { toast } from "@/app/components/Toaster";
import { button } from "@/app/components/ui";

type Photo = { id: string; storage_path: string; sort_order: number; url: string | null };

/** Existing photos (remove) plus new ones (pick, then upload). */
export default function PhotoManager({ listingId, photos, max }: { listingId: string; photos: Photo[]; max: number }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { locale, t } = useI18n();
  const E = t.edit;

  async function upload() {
    setBusy(true);
    setStatus(null);
    try {
      const nextOrder = photos.reduce((m, p) => Math.max(m, p.sort_order + 1), 0);
      const { skipped } = await uploadListingPhotos(listingId, files, nextOrder, (done, total) =>
        setStatus(fill(E.uploadingProgress, { done, total })),
      );
      setFiles([]);
      if (skipped < files.length) toast(plural(locale, files.length - skipped, E.photosAdded));
      setStatus(skipped > 0 ? plural(locale, skipped, E.unreadable) : null);
      router.refresh();
    } catch {
      setStatus(E.uploadFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {photos.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.map((p, i) => (
            <div key={p.id} className="overflow-hidden border border-line bg-panel2">
              {p.url ? (
                // eslint-disable-next-line @next/next/no-img-element -- signed URL rotates per request
                <img src={p.url} alt="" className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="aspect-[4/3]" />
              )}
              <div className="flex items-center justify-between p-1.5">
                <span className="text-[10px] text-grey uppercase">{i === 0 ? E.cover : `#${i + 1}`}</span>
                <ActionButton
                  action={async () => {
                    const r = await removePhotoAction({ id: p.id, storage_path: p.storage_path });
                    router.refresh();
                    return r;
                  }}
                  label={E.remove}
                  tone="danger"
                  confirm={E.removeConfirm}
                  successMessage={E.removed}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <PhotoPicker files={files} onChange={setFiles} max={max - photos.length} coverFirst={photos.length === 0} />

      {files.length > 0 && (
        <button type="button" onClick={upload} disabled={busy} className={`${button("primary", "sm")} mt-3`}>
          {busy ? E.uploading : plural(locale, files.length, E.upload)}
        </button>
      )}
      {status && <p className="mt-2 text-xs text-ink-dim">{status}</p>}
    </div>
  );
}
