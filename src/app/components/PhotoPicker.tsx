"use client";

import { useEffect, useMemo, useRef } from "react";

/**
 * Pick photos before they're uploaded: previews, remove, a cap. Controlled —
 * the parent owns `files` and uploads them when it's ready (after the
 * listing exists, since photos are stored under its id).
 */
export default function PhotoPicker({
  files,
  onChange,
  max,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  max: number;
}) {
  const input = useRef<HTMLInputElement>(null);
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const remaining = max - files.length;

  function add(list: FileList | null) {
    if (!list) return;
    const images = Array.from(list).filter((f) => f.type.startsWith("image/"));
    onChange([...files, ...images].slice(0, max));
    if (input.current) input.current.value = "";
  }

  return (
    <div>
      {files.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {previews.map((url, i) => (
            <div key={url} className="relative aspect-[4/3] overflow-hidden rounded-md border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-gold-bright uppercase">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                aria-label="Remove photo"
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white hover:bg-red"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {remaining > 0 ? (
        <label className="block cursor-pointer rounded-[10px] border-2 border-dashed border-line px-5 py-7 text-center text-[13px] text-ink-dim hover:border-gold">
          <input
            ref={input}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => add(e.target.files)}
          />
          <span className="font-bold text-ink">+ Add photos</span>
          <div className="mt-1.5 text-xs text-grey">
            Up to {remaining} more · the first photo is the cover
          </div>
        </label>
      ) : (
        <p className="text-xs text-grey">That&rsquo;s the maximum of {max} photos.</p>
      )}
    </div>
  );
}
