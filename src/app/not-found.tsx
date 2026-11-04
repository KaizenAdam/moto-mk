import Link from "next/link";
import { button } from "@/app/components/ui";
import { getI18n } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  const N = t.notFound;
  return (
    <main className="mx-auto max-w-xl px-5 py-20 text-center">
      {/* not-found.tsx can't export metadata; React hoists this into <head>. */}
      <title>{`${N.title} - ${t.common.siteName}`}</title>
      <p className="font-display mb-2 text-7xl text-highlight">404</p>
      <h1 className="font-display mb-3 text-3xl">{N.heading}</h1>
      <p className="mb-8 text-[15px] text-ink-dim">{N.body}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/bikes" className={button("primary", "lg")}>
          {N.browse}
        </Link>
        <Link href="/dealers" className={button("outline", "lg")}>
          {N.dealers}
        </Link>
      </div>
    </main>
  );
}
