import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { listUpcoming } from "@/lib/data/events";
import EventsView from "./EventsView";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.meta.eventsTitle,
    description: t.meta.eventsDescription,
  };
}

export default async function EventsPage() {
  const events = await listUpcoming(await createClient());
  return <EventsView events={events} />;
}
