import { StoreIcon } from "./icons";

/**
 * A dealer's shop-front photo, or until they have one, a placeholder of the
 * same size that says so. Dealers can't upload a photo yet (that needs a
 * `photo_path` column on `dealers` and a bucket; docs/HANDOVER-backend.md),
 * so every dealer shows the placeholder for now. Never put a stock shop in
 * here: buyers would take it for the real one.
 */
export default function ShopPhoto({
  photoUrl,
  name,
  className = "",
}: {
  photoUrl?: string | null;
  name: string;
  className?: string;
}) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- signed URL
      <img src={photoUrl} alt={`${name} shop front`} className={`object-cover grayscale-[.2] ${className}`} />
    );
  }

  return (
    <div
      role="img"
      aria-label={`${name}: shop photo coming soon`}
      className={`relative flex flex-col items-center justify-center gap-2 overflow-hidden bg-[#1c1c20] text-grey ${className}`}
      style={{
        backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,.035) 0 14px, transparent 14px 28px)",
      }}
    >
      <StoreIcon className="h-10 w-10 text-[#4a4a52]" />
      <span className="font-display text-xs tracking-[.12em] text-[#77767c]">Shop photo coming soon</span>
    </div>
  );
}
