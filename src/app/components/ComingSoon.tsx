import Link from "next/link";
import { button } from "@/app/components/ui";

export default function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 text-center">
      <span className="mb-4 inline-block rounded-full bg-red px-3 py-1.5 text-[11px] font-bold tracking-wide text-white uppercase">
        Coming Soon
      </span>
      <h1 className="font-display mb-3 text-3xl">{title}</h1>
      <p className="mb-2 text-[15px] text-ink-dim">{description}</p>
      <p className="mb-6 text-[13px] text-grey">
        This section is on the roadmap but isn&rsquo;t built yet — it&rsquo;s here to show where it
        will sit in the finished product.
      </p>
      <Link
        href="/"
        className={button("primary", "lg")}
      >
        ← Back to Buy
      </Link>
    </main>
  );
}
