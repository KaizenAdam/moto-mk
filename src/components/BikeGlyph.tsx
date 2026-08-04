export default function BikeGlyph({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 200 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <circle cx="42" cy="88" r="26" stroke="currentColor" strokeWidth="5" />
      <circle cx="158" cy="88" r="26" stroke="currentColor" strokeWidth="5" />
      <circle cx="42" cy="88" r="6" fill="currentColor" />
      <circle cx="158" cy="88" r="6" fill="currentColor" />
      <path
        d="M42 88L72 50H108L96 70M42 88H96M96 88H130L158 88M96 88L108 70M108 70H140L158 88M108 70L118 50H98"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M72 50L60 34H44"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M118 50C130 50 138 44 148 44"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <rect x="88" y="62" width="24" height="10" rx="3" fill="currentColor" />
    </svg>
  );
}
