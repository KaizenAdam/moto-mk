import { createClient } from "@/lib/supabase/server";
import { listUpcoming } from "@/lib/data/events";
import { PinIcon } from "@/app/components/icons";

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
      <section
        className="border-b border-line px-5 py-8"
        style={{
          background:
            "radial-gradient(circle at 80% 0%, rgba(193,39,45,.18), transparent 55%), radial-gradient(circle at 10% 100%, rgba(212,175,55,.12), transparent 50%), #0e0e11",
        }}
      >
        <div className="mx-auto max-w-[1280px]">
          <h1 className="font-display mb-1.5 text-2xl">Events</h1>
          <p className="text-sm text-ink-dim">
            Rallies, track days and group rides — a calendar for the North Macedonia riding
            community.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-8 pb-14">
        {events.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-line px-5 py-10 text-center text-sm text-ink-dim">
            No upcoming events yet — check back soon.
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const date = formatEventDate(event.event_date);
              return (
                <div key={event.id} className="rounded-[10px] border border-line bg-panel p-5">
                  <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-display text-lg">{event.title}</h2>
                    {date && (
                      <span className="rounded-full border border-gold bg-panel2 px-3 py-1 text-xs font-bold text-gold-bright uppercase">
                        {date}
                      </span>
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
