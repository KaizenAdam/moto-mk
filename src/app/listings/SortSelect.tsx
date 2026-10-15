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
      aria-label="Sort"
      className="border border-line bg-panel2 py-2 pr-2 pl-3 text-[13px] text-ink outline-none focus:border-highlight"
    >
      <option value="newest">Newest first</option>
      <option value="price_low">Price: low to high</option>
      <option value="price_high">Price: high to low</option>
    </select>
  );
}
