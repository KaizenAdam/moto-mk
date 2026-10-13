import { CardGridSkeleton, HeroSkeleton } from "@/app/components/Skeletons";

/** Shown instantly on navigation to the bike search page. */
export default function Loading() {
  return (
    <main>
      <HeroSkeleton />
      <CardGridSkeleton />
    </main>
  );
}
