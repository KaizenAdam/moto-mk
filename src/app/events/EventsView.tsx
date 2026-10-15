import type { Tables } from "@/lib/database.types";
import PageHero from "@/app/components/PageHero";
import EmptyState from "@/app/components/EmptyState";
import EventDate from "@/app/components/EventDate";
import Badge from "@/app/components/Badge";
import { PinIcon } from "@/app/components/icons";
import { card } from "@/app/components/ui";
import AddToCalendar from "./AddToCalendar";

type Event = Tables<"events">;

function mapsUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location}, North Macedonia`)}`;
}

/**
 * /events: the soonest dated event as a "Next up" feature, the rest grouped
 * by month, undated ones last. Markup only; page.tsx fetches.
 */
export default function EventsView({ events }: { events: Event[] }) {
  const dated = events.filter((e) => e.event_date);
  const undated = events.filter((e) => !e.event_date);
  const [next, ...rest] = dated;

  const byMonth = new Map<string, Event[]>();
  for (const e of rest) {
    const key = new Date(`${e.event_date}T00:00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    byMonth.set(key, [...(byMonth.get(key) ?? []), e]);
  }
  if (undated.length > 0) byMonth.set("Date to be confirmed", undated);

  return (
    <main className="pb-16">
      <PageHero
        title="Events"
        intro="Rallies, Moto Sobori, track days and group rides — the calendar for North Macedonia's riding community."
      />

      <div className="mx-auto grid max-w-[1100px] grid-cols-[minmax(0,1fr)] gap-8 px-4 pt-8 sm:px-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-10">
          {events.length === 0 && <EmptyState>No upcoming events yet — check back soon.</EmptyState>}

          {next && (
            <section id={`event-${next.id}`} className="scroll-mt-24 overflow-hidden rounded-[10px] border border-gold/50 bg-gradient-to-br from-gold/10 to-red/10">
              <div className="flex flex-col gap-5 p-6 sm:flex-row sm:p-8">
                <EventDate date={next.event_date} size="lg" />
                <div className="min-w-0 flex-1">
                  <Badge tone="gold">Next up</Badge>
                  <h2 className="font-display mt-2 text-3xl sm:text-4xl">{next.title}</h2>
                  {next.location && (
                    <a
                      href={mapsUrl(next.location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-sm text-grey hover:text-gold-bright"
                    >
                      <PinIcon />
                      {next.location}
                    </a>
                  )}
                  {next.description && (
                    <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-ink">{next.description}</p>
                  )}
                  <div className="mt-5">
                    <AddToCalendar
                      id={next.id}
                      title={next.title}
                      date={next.event_date!}
                      location={next.location}
                      description={next.description}
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {[...byMonth].map(([month, list]) => (
            <section key={month}>
              <h2 className="font-display mb-3 border-b border-line pb-2 text-lg font-semibold tracking-wide text-gold">
                {month}
              </h2>
              <ol className="space-y-3">
                {list.map((e) => (
                  <li key={e.id} id={`event-${e.id}`} className={`${card} flex scroll-mt-24 gap-4 p-4`}>
                    <EventDate date={e.event_date} />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-xl">{e.title}</h3>
                      {e.location && (
                        <a
                          href={mapsUrl(e.location)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-grey hover:text-gold-bright"
                        >
                          <PinIcon />
                          {e.location}
                        </a>
                      )}
                      {e.description && <p className="mt-2 text-sm text-ink-dim">{e.description}</p>}
                      {e.event_date && (
                        <div className="mt-3">
                          <AddToCalendar
                            id={e.id}
                            title={e.title}
                            date={e.event_date}
                            location={e.location}
                            description={e.description}
                          />
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <aside className="space-y-4">
          <div className={`${card} p-5`}>
            <h2 className="font-display text-xl">Got an event?</h2>
            <p className="mt-2 text-sm text-ink-dim">
              Running a rally, track day or group ride? The Just5Up! team adds events to the calendar —
              online submissions are on the way.
            </p>
          </div>
          <div className={`${card} p-5`}>
            <h2 className="font-display text-xl">Never miss one</h2>
            <p className="mt-2 text-sm text-ink-dim">
              &ldquo;Add to calendar&rdquo; drops an event straight into your phone&rsquo;s calendar, with the
              place and details.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
