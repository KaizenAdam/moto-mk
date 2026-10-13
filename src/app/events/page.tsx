import { createClient } from "@/lib/supabase/server";
import { listUpcoming } from "@/lib/data/events";
import { PinIcon } from "@/app/components/icons";
import PageHero from "@/app/components/PageHero";
import Badge from "@/app/components/Badge";
import EmptyState from "@/app/components/EmptyState";

function formatEventDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function EventsPage() {
  const supabase = await createClient();
  const events = await listUpcoming(supabase);

  return (
    <main>
      <PageHero
        title="Events"
        intro="Rallies, track days and group rides — a calendar for the North Macedonia riding community."
      />

      <div className="mx-auto max-w-3xl px-6 py-8 pb-14">
        {events.length === 0 ? (
          <EmptyState>No upcoming events yet — check back soon.</EmptyState>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const date = formatEventDate(event.event_date);
              return (
                <div key={event.id} className="rounded-[10px] border border-line bg-panel p-5">
                  <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-display text-xl">{event.title}</h2>
                    {date && (
                      <Badge tone="outline" size="md">
                        {date}
                      </Badge>
                    )}
                  </div>
                  {event.location && (
                    <div className="mb-2 flex items-center gap-1.5 text-sm text-grey">
                      <PinIcon />
                      {event.location}
                    </div>
                  )}
                  {event.description && (
                    <p className="text-sm text-ink-dim">{event.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
