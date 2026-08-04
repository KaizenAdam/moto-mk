"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { makes } from "@/lib/listings";
import { RidingStyle } from "@/lib/types";

const STYLES: RidingStyle[] = [
  "Enduro",
  "Sport",
  "Cruiser",
  "Scooter",
  "Touring",
  "Naked",
  "Adventure",
];

export default function HeroSearch() {
  const router = useRouter();
  const [make, setMake] = useState("");
  const [style, setStyle] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (make) params.set("make", make);
    if (style) params.set("style", style);
    router.push(`/listings${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-paper/95 backdrop-blur rounded-2xl p-3 md:p-4 flex flex-col md:flex-row gap-3 shadow-2xl border border-tarmac-line/10"
    >
      <select
        value={make}
        onChange={(e) => setMake(e.target.value)}
        aria-label="Make"
        className="flex-1 rounded-lg border border-steel/40 bg-white px-3 py-2.5 text-sm text-tarmac font-body focus-visible:outline-amber"
      >
        <option value="">Any make</option>
        {makes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <select
        value={style}
        onChange={(e) => setStyle(e.target.value)}
        aria-label="Riding style"
        className="flex-1 rounded-lg border border-steel/40 bg-white px-3 py-2.5 text-sm text-tarmac font-body focus-visible:outline-amber"
      >
        <option value="">Any riding style</option>
        {STYLES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-lg bg-rally text-paper font-display uppercase tracking-wide px-6 py-2.5 hover:bg-amber hover:text-tarmac transition-colors"
      >
        Search bikes
      </button>
    </form>
  );
}
