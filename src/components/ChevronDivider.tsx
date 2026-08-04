export default function ChevronDivider({
  subtle = false,
  className = "",
}: {
  subtle?: boolean;
  className?: string;
}) {
  return (
    <div
      role="presentation"
      className={`${subtle ? "chevron-divider--subtle" : "chevron-divider"} ${className}`}
    />
  );
}
