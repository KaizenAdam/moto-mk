"use client";

import { useRouter, usePathname } from "next/navigation";
import { withParam, type SearchParams } from "./queryParams";

export default function SortSelect({ current, searchParams }: { current: string; searchParams: SearchParams }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      value={current}
      onChange={(e) => router.push(`${pathname}?${withParam(searchParams, "sort", e.target.value)}`)}
      className="rounded-md border border-line bg-panel2 px-2 py-2 text-[13px] text-ink outline-none focus:border-gold"
    >
      <option value="newest">Newest first</option>
      <option value="price_low">Price: low to high</option>
      <option value="price_high">Price: high to low</option>
    </select>
  );
}
