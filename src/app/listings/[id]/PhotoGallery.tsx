"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CameraIcon } from "@/app/components/icons";

/**
 * Listing photos, Auto Trader-style: on desktop a mosaic (one big photo,
 * up to four small), on phones a swipeable single photo with a counter.
 * Any photo, or the "Gallery" button, opens a full-screen viewer.
 * Signed URLs, so plain <img>.
 */
export default function PhotoGallery({ urls, alt }: { urls: string[]; alt: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [mobileIndex, setMobileIndex] = useState(0);
  const touchX = useRef<number | null>(null);

  if (urls.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-[10px] bg-gradient-to-br from-[#26262b] to-[#18181b] text-sm text-grey lg:aspect-auto lg:h-[460px]">
        No photos yet
      </div>
    );
  }

  const small = urls.slice(1, 5);
  const galleryButton = (
    <button
      type="button"
      onClick={() => setOpen(0)}
      className="font-display absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md bg-black/75 px-3 py-1.5 text-sm font-semibold tracking-wider text-ink hover:bg-black"
    >
      <CameraIcon className="h-4 w-4" />
      Gallery ({urls.length})
    </button>
  );

  return (
    <>
      {/* Phones and tablets: one photo at a time. */}
      <div
        className="relative aspect-[4/3] overflow-hidden bg-black sm:rounded-[10px] lg:hidden"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) < 40) return;
          setMobileIndex((i) => (i + (dx < 0 ? 1 : -1) + urls.length) % urls.length);
        }}
      >
        <button type="button" onClick={() => setOpen(mobileIndex)} className="block h-full w-full" aria-label="Open gallery">
          {/* eslint-disable-next-line @next/next/no-img-element -- signed URL rotates per request */}
          <img src={urls[mobileIndex]} alt={alt} className="h-full w-full object-cover" draggable={false} />
        </button>
        {urls.length > 1 && (
          <span className="absolute right-3 bottom-3 rounded bg-black/75 px-2 py-0.5 text-xs text-ink">
            {mobileIndex + 1} / {urls.length}
          </span>
        )}
        {galleryButton}
      </div>

      {/* Desktop: mosaic. */}
      <div
        className={`relative hidden h-[460px] gap-2 overflow-hidden rounded-[10px] lg:grid ${
          small.length === 0 ? "grid-cols-1" : small.length === 1 ? "grid-cols-2" : "grid-cols-[2fr_1fr_1fr] grid-rows-2"
        }`}
      >
        <MosaicTile
          url={urls[0]}
          alt={alt}
          onClick={() => setOpen(0)}
          className={small.length > 1 ? "row-span-2" : ""}
          // One photo spans the full width: cropping it to fill would cut
          // most of the bike off, so show all of it on a blurred backdrop.
          contain={small.length === 0}
        />
        {small.map((url, i) => (
          <MosaicTile
            key={url}
            url={url}
            alt=""
            onClick={() => setOpen(i + 1)}
            // Two small photos fill a column each; with three, the first takes
            // a full column and the other two stack in the last.
            className={small.length === 2 || (small.length === 3 && i === 0) ? "row-span-2" : ""}
            more={i === small.length - 1 && urls.length > 5 ? urls.length - 5 : 0}
          />
        ))}
        {galleryButton}
      </div>

      {open != null && <Lightbox urls={urls} alt={alt} start={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function MosaicTile({
  url,
  alt,
  onClick,
  className = "",
  more = 0,
  contain = false,
}: {
  url: string;
  alt: string;
  onClick: () => void;
  className?: string;
  more?: number;
  /** Show the whole photo (letterboxed on a blurred copy of itself) instead of cropping to fill. */
  contain?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} className={`group relative min-h-0 overflow-hidden bg-black ${className}`}>
      {contain && (
        // eslint-disable-next-line @next/next/no-img-element -- signed URL rotates per request
        <img
          src={url}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
          draggable={false}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element -- signed URL rotates per request */}
      <img
        src={url}
        alt={alt}
        className={`relative h-full w-full transition duration-300 ${
          contain ? "object-contain" : "object-cover group-hover:scale-[1.03]"
        }`}
        draggable={false}
      />
      {more > 0 && (
        <span className="font-display absolute inset-0 flex items-center justify-center bg-black/55 text-2xl text-ink">
          +{more} more
        </span>
      )}
    </button>
  );
}

/** Full-screen viewer: arrows, swipe, keyboard (← → Esc), thumbnail strip. */
function Lightbox({ urls, alt, start, onClose }: { urls: string[]; alt: string; start: number; onClose: () => void }) {
  const [index, setIndex] = useState(start);
  const touchX = useRef<number | null>(null);
  const go = useCallback((step: number) => setIndex((i) => (i + step + urls.length) % urls.length), [urls.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [go, onClose]);

  const arrow =
    "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-panel2/80 text-2xl text-ink hover:bg-panel2 hover:text-gold-bright";

  return (
    <div role="dialog" aria-modal="true" aria-label="Photo gallery" className="fixed inset-0 z-[60] flex flex-col bg-black/95">
      <div className="flex items-center justify-between px-4 py-3 text-sm text-ink-dim">
        <span>
          {index + 1} / {urls.length}
        </span>
        <button type="button" onClick={onClose} className="text-3xl leading-none text-ink hover:text-gold-bright" aria-label="Close gallery">
          ×
        </button>
      </div>
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- signed URL rotates per request */}
        <img src={urls[index]} alt={alt} className="max-h-full max-w-full object-contain" draggable={false} />
        {urls.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} className={`${arrow} left-3`} aria-label="Previous photo">
              ‹
            </button>
            <button type="button" onClick={() => go(1)} className={`${arrow} right-3`} aria-label="Next photo">
              ›
            </button>
          </>
        )}
      </div>
      {urls.length > 1 && (
        <div className="flex justify-center gap-2 overflow-x-auto px-4 py-3">
          {urls.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Photo ${i + 1}`}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded border-2 ${
                i === index ? "border-gold" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- signed URL */}
              <img src={url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
