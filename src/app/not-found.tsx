import Link from "next/link";
import { button } from "@/app/components/ui";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-5 py-20 text-center">
      <p className="font-display mb-2 text-7xl text-gold">404</p>
      <h1 className="font-display mb-3 text-3xl">Wrong turn</h1>
      <p className="mb-8 text-[15px] text-ink-dim">
        That page doesn&rsquo;t exist — or the bike&rsquo;s already been sold.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className={button("primary", "lg")}>
          Browse bikes
        </Link>
        <Link href="/dealers" className={button("outline", "lg")}>
          Dealers
        </Link>
      </div>
    </main>
  );
}
