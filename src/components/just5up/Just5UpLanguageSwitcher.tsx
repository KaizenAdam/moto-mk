"use client";

import { useEffect, useRef, useState } from "react";
import { j5u } from "@/lib/just5up-theme";

const LANGUAGES = [
  { code: "EN", label: "English", available: true },
  { code: "MK", label: "Македонски", available: false },
  { code: "SQ", label: "Shqip", available: false },
];

export default function Just5UpLanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("EN");
  const [note, setNote] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 text-xs font-[family-name:var(--font-jetbrains)] uppercase tracking-wider px-2 py-1.5 rounded border transition-colors"
        style={{ color: j5u.ink, borderColor: j5u.borderStrong }}
      >
        {active}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-44 rounded-md py-1 z-50 border shadow-lg"
          style={{ background: j5u.card, borderColor: j5u.border }}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              role="option"
              aria-selected={active === lang.code}
              onClick={() => {
                if (lang.available) {
                  setActive(lang.code);
                  setNote(null);
                } else {
                  setNote(`${lang.label} translation is planned for launch.`);
                }
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-black/5"
              style={{ color: j5u.ink }}
            >
              <span>
                {lang.code} <span style={{ color: j5u.inkMuted }}>— {lang.label}</span>
              </span>
              {!lang.available && (
                <span
                  className="text-[10px] font-[family-name:var(--font-jetbrains)] uppercase"
                  style={{ color: j5u.red }}
                >
                  soon
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      {note && (
        <div
          role="status"
          className="absolute right-0 mt-2 w-56 text-xs rounded-md px-3 py-2 shadow-xl z-50"
          style={{ background: j5u.goldDeep, color: j5u.card }}
        >
          {note}
        </div>
      )}
    </div>
  );
}
