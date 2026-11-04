/**
 * Placeholder shapes shown by the loading.tsx files while a page's data
 * arrives — so a click shows the page's outline immediately instead of
 * nothing. Server components, no data.
 */
const block = "animate-pulse bg-panel2";

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
          <div key={i} className="overflow-hidden border border-line bg-panel">
            <div className={`${block} aspect-[4/3]`} />
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
    <main className="mx-auto max-w-[1280px] pb-14 sm:px-5">
      <div className={`${block} mx-4 my-4 h-4 w-32 sm:mx-0`} />
      <div className={`${block} aspect-[4/3] lg:aspect-auto lg:h-[460px]`} />
      <div className="mt-4 grid gap-4 px-4 sm:px-0 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
        <div className="space-y-4">
          <div className="space-y-3 border border-line bg-panel p-5">
            <div className={`${block} h-8 w-2/3`} />
            <div className={`${block} h-4 w-1/3`} />
            <div className={`${block} h-10 w-40`} />
          </div>
          <div className={`${block} h-40 w-full`} />
        </div>
        <div className={`${block} hidden h-48 lg:block`} />
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

/** The home page: tall hero with search, bike-type tiles, four latest bikes. */
export function HomeSkeleton() {
  return (
    <main className="pb-16">
      <section className="bg-[#141416] px-4 py-12 sm:px-8 lg:h-[580px] lg:py-24">
        <div className="mx-auto max-w-[1280px] space-y-4">
          <div className={`${block} h-14 w-full max-w-[520px]`} />
          <div className={`${block} h-14 w-4/5 max-w-[420px]`} />
          <div className={`${block} h-5 w-full max-w-[460px]`} />
          <div className={`${block} mt-6 h-14 w-full max-w-[600px]`} />
        </div>
      </section>
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
        <div className={`${block} mt-14 mb-5 h-8 w-56 lg:mt-20`} />
        <div className="grid grid-cols-3 gap-1.5 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`${block} aspect-[4/5] [clip-path:polygon(18%_0,100%_0,82%_100%,0_100%)]`} />
          ))}
        </div>
        <div className={`${block} mt-14 mb-6 h-8 w-48`} />
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}

/** The search page: big glow hero with search box, filter bar, results grid. */
export function SearchSkeleton() {
  return (
    <main>
      <section className="border-b border-line px-5 py-10 sm:py-14">
        <div className="mx-auto max-w-[1280px] space-y-3">
          <div className={`${block} h-12 w-80 max-w-full`} />
          <div className={`${block} h-4 w-96 max-w-full`} />
          <div className={`${block} mt-5 h-12 w-full max-w-[640px]`} />
        </div>
      </section>
      <div className="flex flex-wrap gap-2 border-b border-line px-6 py-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={`${block} h-10 w-32`} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 px-6 py-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}

/** One ListingCard's outline: photo, name, specs, price tag, two buttons. */
function CardSkeleton() {
  return (
    <div className="flex flex-col border border-line bg-panel">
      <div className={`${block} aspect-[4/3]`} />
      <div className="space-y-2.5 px-4 pt-3.5 pb-4">
        <div className={`${block} h-5 w-3/4`} />
        <div className={`${block} h-3.5 w-1/2`} />
        <div className={`${block} h-7 w-24`} />
        <div className="grid grid-cols-2 gap-2 pt-3">
          <div className={`${block} h-8`} />
          <div className={`${block} h-8`} />
        </div>
      </div>
    </div>
  );
}
