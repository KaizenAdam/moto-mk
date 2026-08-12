// Signature element for the Just5Up reskin, replacing VoziMoto's hazard-tape
// chevron. Hazard tape reads "industrial workshop safety" — premium and
// orderly. A torn strip of poster paper reads "flyer ripped off a wall and
// stapled over the last one" — the actual band-poster/gig-flyer culture the
// brief asks for, and it's a different *shape* of motif, not a recolor of
// the same stripes.
const TEETH =
  "0% 35%,4% 92%,8% 22%,12% 88%,16% 15%,20% 95%,24% 30%,28% 82%,32% 12%,36% 90%," +
  "40% 40%,44% 96%,48% 20%,52% 85%,56% 8%,60% 92%,64% 32%,68% 80%,72% 18%,76% 94%," +
  "80% 28%,84% 98%,88% 14%,92% 86%,96% 34%,100% 90%,100% 100%,0% 100%";

export default function RippedDivider({
  color,
  height = 26,
}: {
  color: string;
  height?: number;
}) {
  return (
    <div
      role="presentation"
      style={{
        height,
        background: color,
        clipPath: `polygon(${TEETH})`,
      }}
    />
  );
}
