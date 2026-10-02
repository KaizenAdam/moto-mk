"use client";

import { useState } from "react";

/** Main photo plus clickable thumbnails. Signed URLs, so plain <img>. */
export default function PhotoGallery({ urls, alt }: { urls: string[]; alt: string }) {
  const [current, setCurrent] = useState(0);

  if (urls.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-[#26262b] to-[#18181b] text-sm text-grey">
        No photos yet
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-video bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element -- signed URL rotates per request, not a next/image candidate */}
        <img src={urls[current]} alt={alt} className="h-full w-full object-contain" draggable={false} />
      </div>
      {urls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto bg-panel2 p-2">
          {urls.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Photo ${i + 1}`}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded border-2 ${i === current ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- signed URL */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
