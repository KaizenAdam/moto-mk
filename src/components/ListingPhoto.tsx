import BikeGlyph from "./BikeGlyph";
import { RidingStyle } from "@/lib/types";

const STYLE_ACCENT: Record<RidingStyle, string> = {
  Sport: "var(--rally)",
  Naked: "var(--amber)",
  Adventure: "var(--pine)",
  Enduro: "var(--steel-dark)",
  Cruiser: "var(--steel)",
  Scooter: "var(--amber-dim)",
  Touring: "var(--pine)",
};

export default function ListingPhoto({
  ridingStyle,
  make,
  model,
  compact = false,
}: {
  ridingStyle: RidingStyle;
  make: string;
  model: string;
  compact?: boolean;
}) {
  const accent = STYLE_ACCENT[ridingStyle];

  return (
    <div
      className="asphalt relative w-full overflow-hidden"
      style={{ aspectRatio: "4 / 3" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, transparent 40%, ${accent}22 100%)`,
        }}
      />
      <div className="absolute top-0 right-0 chevron-divider rotate-90 origin-top-right opacity-70 h-full w-4" />
      <div className="absolute inset-0 flex items-center justify-center">
        <BikeGlyph
          className={compact ? "w-24 h-auto" : "w-36 h-auto md:w-44"}
          style={{ color: accent } as React.CSSProperties}
        />
      </div>
      <div className="absolute left-0 right-0 bottom-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
        <p className="font-display uppercase tracking-wide text-paper text-sm leading-tight truncate">
          {make} <span className="text-steel">{model}</span>
        </p>
      </div>
      <span
        className="absolute top-2 left-2 rounded px-2 py-0.5 text-[10px] font-data uppercase tracking-widest text-paper/70 bg-black/40"
        aria-hidden="true"
      >
        {ridingStyle}
      </span>
    </div>
  );
}
