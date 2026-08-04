import { EventItem } from "./types";

export const events: EventItem[] = [
  {
    slug: "mavrovo-mountain-sobir-2026",
    title: "Mavrovo Mountain Sobir",
    titleMk: "Мавровски мото собир",
    date: "2026-05-16",
    endDate: "2026-05-17",
    location: "Mavrovo",
    region: "Polog",
    description:
      "Annual two-day gathering above Lake Mavrovo — twisty approach roads, a Saturday-night bonfire, and a Sunday group ride around the national park. The biggest sobir of the season, usually 300+ bikes.",
    type: "Rally",
    attendeesEstimate: 320,
  },
  {
    slug: "ohrid-lakeside-cruise",
    title: "Ohrid Lakeside Cruise",
    date: "2026-06-06",
    location: "Ohrid",
    region: "Southwest",
    description:
      "Relaxed evening cruiser and touring-bike ride along the lake road from Ohrid to Struga, finishing with dinner at the old town harbour. All bikes welcome, no pace pressure.",
    type: "Group Ride",
    attendeesEstimate: 85,
  },
  {
    slug: "skopje-track-day-may",
    title: "Skopje Ring Track Day",
    date: "2026-05-02",
    location: "Skopje",
    region: "Skopje region",
    description:
      "Open track-day session for sportbikes, organised with a licensed instructor on-site. Novice, intermediate, and fast groups run separately. Leathers and full protective gear mandatory.",
    type: "Track Day",
    attendeesEstimate: 60,
  },
  {
    slug: "galicica-enduro-weekend",
    title: "Galičica Enduro Weekend",
    date: "2026-07-11",
    endDate: "2026-07-12",
    location: "Ohrid",
    region: "Southwest",
    description:
      "Two days of green-lane and technical trail riding through Galičica National Park for enduro and adventure bikes. Marked routes for beginner and advanced riders, recovery support on standby.",
    type: "Rally",
    attendeesEstimate: 140,
  },
  {
    slug: "bitola-old-town-meetup",
    title: "Bitola Old Town Coffee Meet",
    date: "2026-04-18",
    location: "Bitola",
    region: "Pelagonija",
    description:
      "Casual Saturday-morning meet-up on Širok Sokak — bring any bike, any style. A regular fixture for Pelagonija riders to swap parts, stories, and route tips before the season picks up.",
    type: "Meet-up",
    attendeesEstimate: 45,
  },
  {
    slug: "tetovo-shar-mountain-run",
    title: "Tetovo–Šar Mountain Run",
    date: "2026-08-08",
    location: "Tetovo",
    region: "Polog",
    description:
      "Scenic ride up toward the Šar Mountains ski-resort road, popular with adventure and naked-bike riders for the hairpin sections. Regroup and grill-out at the halfway point.",
    type: "Group Ride",
    attendeesEstimate: 70,
  },
  {
    slug: "kumanovo-new-season-opener",
    title: "Kumanovo New Season Opener",
    date: "2026-03-28",
    location: "Kumanovo",
    region: "Skopje region",
    description:
      "The traditional season-opening sobir marking the end of winter storage. Bike blessing, vendor stalls for gear and parts, and a short parade lap through town.",
    type: "Rally",
    attendeesEstimate: 210,
  },
];

export function getEventBySlug(slug: string) {
  return events.find((e) => e.slug === slug);
}
