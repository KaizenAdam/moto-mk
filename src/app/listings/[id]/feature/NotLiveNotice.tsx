import Link from "next/link";
import EmptyState from "@/app/components/EmptyState";

/** Only live bikes can be featured — say why and where to go. */
export function NotLiveNotice({ status }: { status: string }) {
  return (
    <EmptyState>
      Only live bikes can be featured. This one is <strong className="text-ink">{status}</strong>
      {status === "pending" ? " — you can feature it once it's approved." : "."}{" "}
      <Link href="/garage" className="text-gold-bright hover:underline">
        Back to My Garage
      </Link>
    </EmptyState>
  );
}
