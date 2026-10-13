export function PinIcon({ className = "h-3 w-3 fill-gold" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.5 7.3 11.7.2.2.4.3.7.3s.5-.1.7-.3C13 21.5 20 15.4 20 10c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
    </svg>
  );
}

/*
 * Line icons for specs (cards, the listing overview). 24px grid, drawn with
 * currentColor so they take the surrounding text colour.
 */
type IconProps = { className?: string };
const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Riding style. */
export function BikeIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...line}>
      <circle cx="5" cy="16" r="3.5" />
      <circle cx="19" cy="16" r="3.5" />
      <path d="M5 16l4-7h5l5 7M9 9l-1.5-3H5M14 9l1-3h3" />
    </svg>
  );
}

/** Engine size (cc). */
export function EngineIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...line}>
      <rect x="6" y="8" width="12" height="10" rx="1.5" />
      <path d="M9 8V5h6v3M3 12h3M18 12h3M10 18v2M14 18v2" />
    </svg>
  );
}

/** Mileage. */
export function GaugeIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...line}>
      <path d="M4 17a8 8 0 1 1 16 0" />
      <path d="M12 17l4-5" />
      <circle cx="12" cy="17" r="1" />
    </svg>
  );
}

/** Engine type (2-stroke / 4-stroke / electric). */
export function FuelIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...line}>
      <path d="M5 20V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15M4 20h11M5 10h9" />
      <path d="M14 8l3 2v7a1.5 1.5 0 0 0 3 0v-6l-2-3" />
    </svg>
  );
}

/** Year. */
export function CalendarIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...line}>
      <rect x="4" y="5" width="16" height="15" rx="1.5" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </svg>
  );
}

/** Licence category. */
export function IdIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...line}>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <circle cx="9" cy="11" r="2" />
      <path d="M6 16c.5-1.5 1.6-2 3-2s2.5.5 3 2M14 10h4M14 13h3" />
    </svg>
  );
}

/** Photo count. */
export function CameraIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...line}>
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

/** Location (outline version of PinIcon, for spec rows). */
export function PlaceIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...line}>
      <path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
