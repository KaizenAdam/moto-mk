import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listUpcoming } from "@/lib/data/events";
import EventsView from "./EventsView";

export const metadata: Metadata = {
  title: "Motorcycle events in North Macedonia",
  description: "Rallies, Moto Sobori, track days and group rides across North Macedonia.",
};

export default async function EventsPage() {
  const events = await listUpcoming(await createClient());
  return <EventsView events={events} />;
}
