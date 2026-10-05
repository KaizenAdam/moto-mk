import { CardGridSkeleton, HeroSkeleton } from "@/app/components/Skeletons";

export default function Loading() {
  return (
    <main>
      <HeroSkeleton />
      <CardGridSkeleton count={6} />
    </main>
  );
}
