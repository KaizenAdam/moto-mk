import Image from "next/image";
import BikeGlyph from "../BikeGlyph";
import { RidingStyle } from "@/lib/types";
import { j5u } from "@/lib/just5up-theme";

const STYLE_ACCENT: Record<RidingStyle, string> = {
  Sport: j5u.red,
  Naked: j5u.goldDeep,
  Adventure: j5u.inkMuted,
  Enduro: j5u.goldDeep,
  Cruiser: j5u.inkMuted,
  Scooter: j5u.goldDeep,
  Touring: j5u.inkMuted,
};

export default function Just5UpListingPhoto({
  ridingStyle,
  sellerType,
  photoUrl,
  alt,
}: {
  ridingStyle: RidingStyle;
  sellerType: "Private" | "Dealer";
  photoUrl?: string;
  alt: string;
}) {
  const accent = STYLE_ACCENT[ridingStyle];

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: "4 / 3", background: j5u.bg }}
    >
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={alt}
          fill
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <BikeGlyph className="w-28 h-auto md:w-32" style={{ color: accent, opacity: 0.85 }} />
        </div>
      )}
      <span
        className="absolute top-2 left-2 rounded-sm px-2 py-1 text-[11px] font-[family-name:var(--font-jetbrains)] font-medium"
        style={{ background: j5u.ink, color: j5u.card }}
      >
        {sellerType === "Dealer" ? "Dealer" : "Private seller"}
      </span>
    </div>
  );
}
