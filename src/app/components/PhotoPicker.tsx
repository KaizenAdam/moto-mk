"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { button } from "./ui";

/**
 * Pick photos before they're uploaded: drop or browse, a big cover, ← → to
 * reorder, "Make cover", remove, a cap. Controlled — the parent owns
 * `files` (in display order, cover first) and uploads them when it's ready
 * (after the listing exists, since photos are stored under its id).
 */
export default function PhotoPicker({
  files,
  onChange,
  max,
  coverFirst = true,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  max: number;
  /**
   * The first picked photo becomes the listing's cover. False when adding
   * to a listing that already has photos (the edit page): new ones go
   * after the existing ones, so none of them is the cover.
   */
  coverFirst?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const remaining = max - files.length;

  function add(list: FileList | null) {
    if (!list) return;
    const images = Array.from(list).filter((f) => f.type.startsWith("image/"));
    onChange([...files, ...images].slice(0, max));
    if (input.current) input.current.value = "";
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= files.length) return;
    const next = [...files];
    const [f] = next.splice(from, 1);
    next.splice(to, 0, f);
    onChange(next);
  }

  const tool =
    "flex h-7 min-w-7 items-center justify-center rounded-full bg-black/75 px-2 text-xs text-white hover:bg-gold hover:text-[#141414] disabled:opacity-30 disabled:hover:bg-black/75 disabled:hover:text-white";

  return (
    <div>
      {files.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previews.map((url, i) => (
            <div
              key={url}
              className={`relative overflow-hidden rounded-md border ${
                coverFirst && i === 0
                  ? "col-span-3 aspect-[16/10] border-gold sm:col-span-2 sm:row-span-2"
                  : "aspect-[4/3] border-line"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              {coverFirst && i === 0 && (
                <span className="font-display absolute top-2 left-2 rounded bg-gold px-2 py-0.5 text-[11px] font-semibold tracking-wider text-[#141414]">
                  Cover
                </span>
              )}
              <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move earlier" className={tool}>
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, i + 1)}
                    disabled={i === files.length - 1}
                    aria-label="Move later"
                    className={tool}
                  >
                    →
                  </button>
                </div>
                <div className="flex gap-1">
                  {coverFirst && i > 0 && (
                    <button type="button" onClick={() => move(i, 0)} title="Make cover" aria-label="Make cover" className={`${tool} whitespace-nowrap`}>
                      ★ Cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onChange(files.filter((_, j) => j !== i))}
                    aria-label="Remove photo"
                    className={`${tool} hover:bg-red hover:text-white`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {remaining > 0 ? (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            add(e.dataTransfer.files);
          }}
          className={`block cursor-pointer rounded-[10px] border-2 border-dashed px-5 py-8 text-center text-[13px] transition ${
            dragging ? "border-gold bg-gold/10 text-ink" : "border-line text-ink-dim hover:border-gold"
          }`}
        >
          <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => add(e.target.files)} />
          <span className={`${button("outline", "sm")} pointer-events-none`}>+ Add photos</span>
          <span className="mt-2 block">or drop them here</span>
          <span className="mt-1 block text-xs text-grey">
            {files.length} of {max}
            {coverFirst ? " · the first photo is the cover" : " · added after your current photos"}
          </span>
        </label>
      ) : (
        <p className="text-xs text-grey">That&rsquo;s the maximum of {max} photos — remove one to add another.</p>
      )}
    </div>
  );
}
