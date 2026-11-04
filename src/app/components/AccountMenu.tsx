"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { AccountIcon, ChevronDownIcon } from "./icons";
import { useI18n } from "./I18nProvider";

/** The signed-in user's links, in one place instead of across the header. */
export const ACCOUNT_LINKS = [
  { href: "/garage", key: "myGarage" },
  { href: "/feature", key: "featureABike" },
  { href: "/sell", key: "sellYourBike" },
] as const;

/**
 * "My account" in the desktop header: a dropdown with the account links
 * and Sign out. Closes on Escape, on a click outside and on navigation.
 */
export default function AccountMenu({ name }: { name: string | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="account-menu"
        className="font-display flex items-center gap-1.5 border-2 border-line px-3 py-2 text-sm font-semibold tracking-[.06em] whitespace-nowrap text-white transition hover:border-red aria-expanded:border-red"
      >
        <AccountIcon />
        {t.common.myAccount}
        <ChevronDownIcon className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          id="account-menu"
          role="menu"
          className="absolute top-full right-0 z-50 mt-2 w-60 border border-line border-t-4 border-t-highlight bg-[#0e0e11] shadow-[0_12px_30px_rgba(0,0,0,0.6)]"
        >
          {name && (
            <p className="border-b border-line px-4 py-3 text-xs text-grey">
              {t.common.signedInAs} <span className="text-ink">{name}</span>
            </p>
          )}
          <div className="py-1.5">
            {ACCOUNT_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="font-display block px-4 py-2.5 text-[15px] tracking-[.04em] text-ink transition hover:bg-panel2 hover:text-highlight"
              >
                {t.common[l.key]}
              </Link>
            ))}
          </div>
          <form action={signOut} className="border-t border-line">
            <button
              type="submit"
              role="menuitem"
              className="font-display block w-full px-4 py-2.5 text-left text-[15px] tracking-[.04em] text-red transition hover:bg-panel2"
            >
              {t.common.signOut}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
