import { CardGridSkeleton, HeroSkeleton } from "@/app/components/Skeletons";

/** Shown instantly on navigation to the home page (and any route without its own). */
export default function Loading() {
  return (
    <main>
      <HeroSkeleton />
      <CardGridSkeleton />
    </main>
  );
}
