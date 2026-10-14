/**
 * An event's date as a calendar block (day over month), or "TBC" when an
 * event has no date yet. Used by the home page's events feed, /events and
 * the admin portal.
 */
export default function EventDate({ date, size = "sm" }: { date: string | null; size?: "sm" | "lg" }) {
  const d = date ? new Date(`${date}T00:00:00`) : null;
  const big = size === "lg";
  return (
    <span
      className={`flex shrink-0 flex-col items-center justify-center self-start rounded-md border border-line bg-panel2 ${
        big ? "w-20 py-3" : "w-12 py-1.5"
      }`}
    >
      {d ? (
        <>
          <span className={`font-display leading-none text-gold-bright ${big ? "text-4xl" : "text-2xl"}`}>
            {d.getDate()}
          </span>
          <span className={`mt-0.5 tracking-wider text-ink-dim uppercase ${big ? "text-xs" : "text-[10px]"}`}>
            {d.toLocaleDateString("en-GB", { month: "short" })}
            {big && ` ${d.getFullYear()}`}
          </span>
        </>
      ) : (
        <span className={`font-display text-ink-dim ${big ? "text-lg" : "text-sm"}`}>TBC</span>
      )}
    </span>
  );
}
