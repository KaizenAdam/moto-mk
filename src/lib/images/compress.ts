/**
 * Browser-only. Phone photos are 3–8 MB; listings need ~200 KB. Scales the
 * longest side down to 1600px and re-encodes as JPEG, which also strips
 * EXIF (including GPS location) from what gets uploaded. Throws for a file
 * the browser can't decode (e.g. HEIC on Chrome) so the caller can say so.
 */
const MAX_SIDE = 1600;
const QUALITY = 0.82;

export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn't process this image.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Couldn't compress this image."))),
      "image/jpeg",
      QUALITY
    )
  );
}
