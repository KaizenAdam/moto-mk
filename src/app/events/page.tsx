import EventsList from "@/components/EventsList";
import RoadbookStrip from "@/components/RoadbookStrip";
import ChevronDivider from "@/components/ChevronDivider";

export const metadata = {
  title: "Sobiri & Events — VoziMoto",
};

export default function EventsPage() {
  return (
    <div>
      <div className="asphalt py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <p className="font-data uppercase tracking-widest text-amber text-xs mb-2">
            Community · Moto Sobiri
          </p>
          <h1 className="font-display uppercase text-3xl md:text-4xl text-paper max-w-2xl">
            Rallies, group rides & meet-ups across the country
          </h1>
          <p className="text-paper/70 mt-3 max-w-xl text-sm">
            From the season-opening sobir in Kumanovo to the Mavrovo mountain
            rally — find where riders are gathering next.
          </p>
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <RoadbookStrip />
        </div>
      </div>
      <ChevronDivider subtle />
      <div className="mx-auto max-w-4xl px-4 md:px-6 py-12 md:py-16">
        <EventsList />
      </div>
    </div>
  );
}
