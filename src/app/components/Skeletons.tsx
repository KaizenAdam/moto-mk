/**
 * Placeholder shapes shown by the loading.tsx files while a page's data
 * arrives — so a click shows the page's outline immediately instead of
 * nothing. Server components, no data.
 */
const block = "animate-pulse rounded bg-panel2";

export function HeroSkeleton() {
  return (
    <section className="border-b border-line px-5 py-9">
      <div className="mx-auto max-w-[1280px] space-y-3">
        <div className={`${block} h-8 w-72`} />
        <div className={`${block} h-4 w-96 max-w-full`} />
      </div>
    </section>
  );
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="px-6 py-6">
      <div className={`${block} mb-4 h-5 w-40`} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-[10px] border border-line bg-panel">
            <div className={`${block} aspect-[4/3] rounded-none`} />
            <div className="space-y-2 px-3 pt-2.5 pb-3">
              <div className={`${block} h-4 w-3/4`} />
              <div className={`${block} h-5 w-1/3`} />
              <div className={`${block} h-3 w-1/2`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListingDetailSkeleton() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <div className={`${block} mb-4 h-4 w-32`} />
      <div className="overflow-hidden rounded-[10px] border border-line bg-panel">
        <div className={`${block} aspect-video rounded-none`} />
        <div className="space-y-3 p-5">
          <div className={`${block} h-7 w-2/3`} />
          <div className={`${block} h-9 w-40`} />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`${block} h-6 w-16`} />
            ))}
          </div>
          <div className={`${block} h-24 w-full`} />
        </div>
      </div>
    </main>
  );
}

export function PageSkeleton() {
  return (
    <main className="mx-auto max-w-[1100px] space-y-4 px-5 py-8">
      <div className={`${block} h-8 w-56`} />
      <div className={`${block} h-4 w-80 max-w-full`} />
      <div className={`${block} h-40 w-full`} />
      <div className={`${block} h-40 w-full`} />
    </main>
  );
}
