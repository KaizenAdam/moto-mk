"use client";

import { useMemo, useState } from "react";
import type { Tables } from "@/lib/database.types";
import { BlockHero, Eyebrow, GoldBanner, HighlightWord, RedBand } from "@/app/components/Bands";
import EmptyState from "@/app/components/EmptyState";
import { PinIcon, SearchIcon } from "@/app/components/icons";
import AddToCalendar from "./AddToCalendar";
import { useI18n } from "@/app/components/I18nProvider";
import { formatDate, plural } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/config";

type Event = Tables<"events">;

/** The When filter; labels are the dictionary's `events.when`. */
const WHEN = ["any", "month", "3months", "tbc"] as const;
type When = (typeof WHEN)[number];

function mapsUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location}, North Macedonia`)}`;
}

function toDate(d: string) {
  return new Date(`${d}T00:00:00`);
}

/** Does this event fall in the chosen window? `today` is local midnight. */
function inWindow(e: Event, when: When, today: Date) {
  if (when === "any") return true;
  if (when === "tbc") return !e.event_date;
  if (!e.event_date) return false;
  const d = toDate(e.event_date);
  const end =
    when === "month"
      ? new Date(today.getFullYear(), today.getMonth() + 1, 1)
      : new Date(today.getFullYear(), today.getMonth() + 3, today.getDate() + 1);
  return d < end;
}

const select =
  "font-display h-11 border bg-panel px-3 text-sm tracking-[.04em] text-ink outline-none transition focus:border-highlight";

/**
 * /events: a search box and filters (place, when), the soonest matching
 * event in a red "Next up" band, the rest grouped by month, undated last.
 * All filtering is in the browser: the page already has every upcoming
 * event, so there's nothing to refetch. Markup only; page.tsx fetches.
 */
export default function EventsView({ events }: { events: Event[] }) {
  const [query, setQuery] = useState("");
  const [place, setPlace] = useState("");
  const [when, setWhen] = useState<When>("any");
  const { locale, t } = useI18n();
  const E = t.events;

  const places = useMemo(
    () => [...new Set(events.map((e) => e.location).filter((l): l is string => !!l))].sort(),
    [events],
  );

  const shown = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const q = query.trim().toLowerCase();
    return events.filter(
      (e) =>
        (!q || [e.title, e.description, e.location].some((f) => f?.toLowerCase().includes(q))) &&
        (!place || e.location === place) &&
        inWindow(e, when, today),
    );
  }, [events, query, place, when]);

  const filtered = query.trim() !== "" || place !== "" || when !== "any";
  const dated = shown.filter((e) => e.event_date);
  const undated = shown.filter((e) => !e.event_date);
  const [next, ...rest] = dated;

  const byMonth = new Map<string, Event[]>();
  for (const e of rest) {
    const key = formatDate(locale, toDate(e.event_date!), "monthLongYear");
    byMonth.set(key, [...(byMonth.get(key) ?? []), e]);
  }
  if (undated.length > 0) byMonth.set(E.dateTbc, undated);

  const clear = () => {
    setQuery("");
    setPlace("");
    setWhen("any");
  };

  return (
    <main className="pb-16">
      <BlockHero
        title={
          <>
            {E.title1} <HighlightWord>{E.title2}</HighlightWord>
          </>
        }
        intro={E.intro}
        ticks={E.ticks}
        shard={{
          shape: "double",
          className:
            "top-[-12%] right-[-180px] h-[124%] w-[460px] rotate-[6deg] bg-red/[.28] sm:right-[-40px] sm:w-[640px]",
        }}
      >
        <div className="flex max-w-[640px] flex-col gap-2 sm:flex-row">
          <label className="flex min-w-0 flex-1 items-center bg-white">
            <span className="sr-only">{E.searchLabel}</span>
            <SearchIcon className="ml-4 h-5 w-5 shrink-0 text-[#77767c]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={E.searchPlaceholder}
              className="min-w-0 flex-1 border-0 bg-transparent px-3 py-4 text-base text-[#111] outline-none placeholder:text-[#77767c]"
            />
          </label>
        </div>
      </BlockHero>

      <div className="border-b border-line">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-2.5 px-5 py-4">
          <label className="sr-only" htmlFor="events-place">
            {E.place}
          </label>
          <select
            id="events-place"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            className={`${select} ${place ? "border-highlight" : "border-line"}`}
          >
            <option value="">{E.anywhere}</option>
            {places.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <div role="group" aria-label={E.whenLabel} className="flex flex-wrap gap-2">
            {WHEN.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWhen(w)}
                aria-pressed={when === w}
                className={`font-display h-11 border px-3.5 text-sm tracking-[.04em] transition ${
                  when === w
                    ? "border-highlight bg-highlight text-[#111]"
                    : "border-line bg-panel text-ink hover:border-highlight"
                }`}
              >
                {E.when[w]}
              </button>
            ))}
          </div>
          <p className="ml-auto text-sm text-grey" aria-live="polite">
            {plural(locale, shown.length, E.count)}
            {filtered && (
              <>
                {" · "}
                <button type="button" onClick={clear} className="text-highlight hover:underline">
                  {t.common.clear}
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="mx-auto max-w-[1280px] px-5 pt-10">
          <EmptyState>{E.noneYet}</EmptyState>
        </div>
      ) : shown.length === 0 ? (
        <div className="mx-auto max-w-[1280px] px-5 pt-10">
          <EmptyState>
            {E.noMatch}{" "}
            <button type="button" onClick={clear} className="text-highlight hover:underline">
              {E.showAll}
            </button>
          </EmptyState>
        </div>
      ) : null}

      {next && (
        <RedBand
          id={`event-${next.id}`}
          className="mt-10"
          shard={{
            shape: "bent",
            className: "top-[-25%] right-[-40px] h-[150%] w-[380px] rotate-[6deg] bg-black/[.18] sm:right-[6%]",
          }}
        >
          <Eyebrow>{E.nextUp}</Eyebrow>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            <BigDate date={next.event_date!} locale={locale} />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-4xl leading-none sm:text-5xl">{next.title}</h2>
              {next.location && (
                <a
                  href={mapsUrl(next.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-[15px] hover:underline"
                >
                  <PinIcon className="h-4 w-4 text-white" />
                  {next.location}
                </a>
              )}
              {next.description && (
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed whitespace-pre-line">{next.description}</p>
              )}
              <div className="mt-6">
                <AddToCalendar
                  id={next.id}
                  title={next.title}
                  date={next.event_date!}
                  location={next.location}
                  description={next.description}
                  className="font-display bg-[#111] px-5 py-3 text-sm font-semibold tracking-[.08em] text-white transition hover:bg-black"
                />
              </div>
            </div>
          </div>
        </RedBand>
      )}

      <div className="mx-auto max-w-[1280px] space-y-12 px-5 pt-12">
        {[...byMonth].map(([month, list]) => (
          <section key={month}>
            <h2 className="font-display mb-5 text-[28px] font-semibold sm:text-[32px]">{month}</h2>
            <ol className="space-y-3">
              {list.map((e) => (
                <li
                  key={e.id}
                  id={`event-${e.id}`}
                  className="flex scroll-mt-24 flex-wrap items-center gap-x-6 gap-y-3 border border-line border-l-4 border-l-red bg-panel px-5 py-5"
                >
                  <SmallDate date={e.event_date} locale={locale} tbc={t.eventDate.tbc} />
                  <div className="min-w-0 flex-1 basis-40">
                    <h3 className="font-display text-[22px] leading-tight">{e.title}</h3>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-dim">
                      {e.location && (
                        <a
                          href={mapsUrl(e.location)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-grey hover:text-highlight"
                        >
                          <PinIcon />
                          {e.location}
                        </a>
                      )}
                      {e.description && <span>{e.description}</span>}
                    </p>
                  </div>
                  {e.event_date && (
                    <AddToCalendar
                      id={e.id}
                      title={e.title}
                      date={e.event_date}
                      location={e.location}
                      description={e.description}
                    />
                  )}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <div className="mt-16">
        <GoldBanner
          title={E.gotEvent}
          shard={{
            shape: "bent",
            className: "top-[-20%] right-[4%] hidden h-[140%] w-[34%] rotate-[-8deg] bg-[#111] opacity-90 md:block",
          }}
          body={E.gotEventBody}
        />
      </div>
    </main>
  );
}

/** The Next-up date: a gold block with the day, month and year. */
function BigDate({ date, locale }: { date: string; locale: Locale }) {
  const d = toDate(date);
  return (
    <span className="w-28 shrink-0 bg-highlight py-3 text-center text-[#111]">
      <span className="font-display block text-6xl leading-none">{d.getDate()}</span>
      <span className="font-display mt-1 block text-sm tracking-[.12em] uppercase">
        {formatDate(locale, d, "monthShortYear")}
      </span>
      <span className="block text-xs">{formatDate(locale, d, "weekdayLong")}</span>
    </span>
  );
}

/** A list row's date, as on the home page's red band. */
function SmallDate({ date, locale, tbc }: { date: string | null; locale: Locale; tbc: string }) {
  const d = date ? toDate(date) : null;
  return (
    <span className="w-14 shrink-0 text-center">
      {d ? (
        <>
          <span className="font-display block text-4xl leading-none text-highlight">{d.getDate()}</span>
          <span className="block text-xs tracking-[.1em] text-ink-dim uppercase">
            {formatDate(locale, d, "weekdayShort")}
          </span>
        </>
      ) : (
        <span className="font-display block text-xl text-highlight">{tbc}</span>
      )}
    </span>
  );
}
