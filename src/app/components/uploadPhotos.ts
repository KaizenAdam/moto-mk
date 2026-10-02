"use client";

import { createClient } from "@/lib/supabase/client";
import { addPhotos } from "@/lib/data/listingPhotos";
import { compressImage } from "@/lib/images/compress";

/**
 * Compress then upload, one at a time so a phone on 4G isn't pushing ten
 * files at once. Reports progress; returns how many couldn't be read
 * (e.g. HEIC on a browser that can't decode it) so the UI can say so.
 */
export async function uploadListingPhotos(
  listingId: string,
  files: File[],
  firstSortOrder: number,
  onProgress?: (done: number, total: number) => void
) {
  const supabase = createClient();
  let skipped = 0;
  let order = firstSortOrder;
  for (const [i, file] of files.entries()) {
    onProgress?.(i, files.length);
    let blob: Blob;
    try {
      blob = await compressImage(file);
    } catch {
      skipped++;
      continue;
    }
    await addPhotos(supabase, listingId, [blob], order++);
  }
  onProgress?.(files.length, files.length);
  return { skipped };
}
