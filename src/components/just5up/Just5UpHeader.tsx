"use client";

import Image from "next/image";
import Just5UpCurrencyToggle from "./Just5UpCurrencyToggle";
import Just5UpLanguageSwitcher from "./Just5UpLanguageSwitcher";
import { j5u } from "@/lib/just5up-theme";
import { useSaved } from "@/lib/just5up-saved";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 20.5s-7.5-4.6-9.8-9.1C.6 8 1.9 4.3 5.4 3.4c2.1-.6 4.2.3 5.6 2.1.4.5 1 .5 1.4 0 1.4-1.8 3.5-2.7 5.6-2.1 3.5.9 4.8 4.6 3.2 8-2.3 4.5-9.8 9.1-9.8 9.1z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M3.5 20.5c1.8-4 5-6 8.5-6s6.7 2 8.5 6" />
    </svg>
  );
}

export default function Just5UpHeader() {
  const { count } = useSaved();

  return (
    <header
      className="sticky top-0 z-40 border-b-2"
      style={{ background: j5u.card, borderColor: j5u.goldDeep }}
    >
      <div className="w-full px-4 md:px-8 flex items-center justify-between h-16">
        <Image
          src="/brand/just5up-mark.png"
          alt="Just5Up!"
          width={640}
          height={511}
          priority
          className="h-12 w-auto"
        />

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="hidden md:flex items-center gap-1.5 text-sm transition-colors hover:opacity-70"
            style={{ color: j5u.ink }}
          >
            <HeartIcon filled={count > 0} />
            Saved{count > 0 ? ` (${count})` : ""}
          </button>
          <button
            type="button"
            className="hidden md:flex items-center gap-1.5 text-sm transition-colors hover:opacity-70"
            style={{ color: j5u.ink }}
          >
            <UserIcon />
            Sign in
          </button>

          <div className="h-6 w-px hidden md:block" style={{ background: j5u.border }} />

          <Just5UpCurrencyToggle />
          <Just5UpLanguageSwitcher />
          <button
            type="button"
            className="hidden sm:inline-flex items-center font-[family-name:var(--font-anton)] tracking-wide text-sm px-4 py-2 rounded-sm transition-colors"
            style={{ background: j5u.goldDeep, color: j5u.card }}
          >
            + List a Bike
          </button>
        </div>
      </div>
    </header>
  );
}
