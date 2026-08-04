"use client";

import { useCurrency } from "@/lib/currency";

export default function PricePlate({
  priceEur,
  size = "md",
}: {
  priceEur: number;
  size?: "sm" | "md" | "lg";
}) {
  const { format } = useCurrency();

  const sizeClasses = {
    sm: "text-sm px-2.5 py-1",
    md: "text-base px-3 py-1.5",
    lg: "text-2xl px-4 py-2",
  }[size];

  return (
    <span
      className={`rally-plate inline-flex items-center gap-1 font-semibold text-tarmac ${sizeClasses}`}
    >
      {format(priceEur)}
    </span>
  );
}
