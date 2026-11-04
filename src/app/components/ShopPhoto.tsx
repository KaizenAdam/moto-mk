"use client";

import { StoreIcon } from "./icons";
import { useI18n } from "./I18nProvider";
import { fill } from "@/lib/i18n/format";

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
  const { t } = useI18n();
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- signed URL
      <img
        src={photoUrl}
        alt={fill(t.dealers.shopPhotoAlt, { name })}
        className={`object-cover grayscale-[.2] ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`${name}: ${t.dealers.shopPhotoSoon}`}
      className={`relative flex flex-col items-center justify-center gap-2 overflow-hidden bg-[#1c1c20] text-grey ${className}`}
      style={{
        backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,.035) 0 14px, transparent 14px 28px)",
      }}
    >
      <StoreIcon className="h-10 w-10 text-[#4a4a52]" />
      <span className="font-display text-xs tracking-[.12em] text-[#77767c]">{t.dealers.shopPhotoSoon}</span>
    </div>
  );
}
