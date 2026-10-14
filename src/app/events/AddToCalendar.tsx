"use client";

import { button } from "@/app/components/ui";

/**
 * Downloads an all-day .ics for one event, built in the browser from the
 * fields already on the page — opens in Apple/Google/Outlook calendars.
 */
export default function AddToCalendar({
  id,
  title,
  date,
  location,
  description,
}: {
  id: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  location: string | null;
  description: string | null;
}) {
  function download() {
    const day = date.replaceAll("-", "");
    const next = new Date(`${date}T00:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    const dayAfter = next.toISOString().slice(0, 10).replaceAll("-", "");
    // RFC 5545 text: escape backslashes, commas, semicolons and newlines.
    const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\r?\n/g, "\\n");
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Just5Up!//Events//EN",
      "BEGIN:VEVENT",
      `UID:${id}@just5up`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${day}`,
      `DTEND;VALUE=DATE:${dayAfter}`,
      `SUMMARY:${esc(title)}`,
      location ? `LOCATION:${esc(location)}` : null,
      description ? `DESCRIPTION:${esc(description)}` : null,
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .filter(Boolean)
      .join("\r\n");

    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^\w-]+/g, "-").toLowerCase()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={download} className={button("outline", "sm")}>
      + Add to calendar
    </button>
  );
}
