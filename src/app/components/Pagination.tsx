import Link from "next/link";

type SearchParams = Record<string, string | string[] | undefined>;

function hrefFor(searchParams: SearchParams, page: number) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    const s = Array.isArray(v) ? v[0] : v;
    if (s && k !== "page") params.set(k, s);
  }
  if (page > 1) params.set("page", String(page));
  const q = params.toString();
  return q ? `/bikes?${q}` : "/bikes";
}

/** Numbered page links that keep the current filters. Window of pages around the current one. */
export default function Pagination({
  page,
  pageCount,
  searchParams,
}: {
  page: number;
  pageCount: number;
  searchParams: SearchParams;
}) {
  if (pageCount <= 1) return null;

  const pages = new Set([1, pageCount, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pageCount));
  const sorted = [...pages].sort((a, b) => a - b);

  const cell = "flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-bold";
  return (
    <nav aria-label="Pages" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link href={hrefFor(searchParams, page - 1)} aria-label="Previous page" className={`${cell} border-line text-ink hover:border-gold`}>
          ←<span className="hidden sm:inline">&nbsp;Prev</span>
        </Link>
      )}
      {sorted.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && p - sorted[i - 1] > 1 && <span className="text-grey">…</span>}
          <Link
            href={hrefFor(searchParams, p)}
            aria-current={p === page ? "page" : undefined}
            className={`${cell} ${p === page ? "border-gold bg-gold text-[#141414]" : "border-line text-ink hover:border-gold"}`}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < pageCount && (
        <Link href={hrefFor(searchParams, page + 1)} aria-label="Next page" className={`${cell} border-line text-ink hover:border-gold`}>
          <span className="hidden sm:inline">Next&nbsp;</span>→
        </Link>
      )}
    </nav>
  );
}
