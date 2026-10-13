import Link from "next/link";
import { button } from "@/app/components/ui";
import Badge from "@/app/components/Badge";

export default function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 text-center">
      <Badge tone="red" size="md" className="mb-4">
        Coming Soon
      </Badge>
      <h1 className="font-display mb-3 text-3xl">{title}</h1>
      <p className="mb-2 text-[15px] text-ink-dim">{description}</p>
      <p className="mb-6 text-[13px] text-grey">
        This section is on the roadmap but isn&rsquo;t built yet — it&rsquo;s here to show where it
        will sit in the finished product.
      </p>
      <Link
        href="/bikes"
        className={button("primary", "lg")}
      >
        ← Back to Buy
      </Link>
    </main>
  );
}
