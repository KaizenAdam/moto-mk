import Link from "next/link";
import EmptyState from "@/app/components/EmptyState";
import { getI18n } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/format";

/** Only live bikes can be featured — say why and where to go. */
export async function NotLiveNotice({ status }: { status: string }) {
  const { t } = await getI18n();
  return (
    <EmptyState>
      {fill(t.feature.onlyLive, { status: t.statuses[status] ?? status })}
      {status === "pending" ? t.feature.onceApproved : "."}{" "}
      <Link href="/garage" className="text-highlight hover:underline">
        {t.feature.backToGarage}
      </Link>
    </EmptyState>
  );
}
