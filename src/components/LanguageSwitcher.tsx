"use client";

import { useState, useRef, useEffect } from "react";

const LANGUAGES = [
  { code: "EN", label: "English", available: true },
  { code: "MK", label: "Македонски", available: false },
  { code: "SQ", label: "Shqip", available: false },
];

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("EN");
  const [note, setNote] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
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
        className="flex items-center gap-1.5 text-sm font-data uppercase tracking-wider text-paper/80 hover:text-amber transition-colors px-2 py-1 rounded"
      >
        {active}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-44 bg-tarmac-raised border border-tarmac-line rounded-lg shadow-xl py-1 z-50"
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
              className="w-full text-left px-3 py-2 text-sm text-paper/90 hover:bg-tarmac-line flex items-center justify-between"
            >
              <span>
                {lang.code} <span className="text-steel">— {lang.label}</span>
              </span>
              {!lang.available && (
                <span className="text-[10px] font-data uppercase text-amber">soon</span>
              )}
            </button>
          ))}
        </div>
      )}
      {note && (
        <div
          role="status"
          className="absolute right-0 mt-2 w-56 bg-amber text-tarmac text-xs font-body rounded-lg px-3 py-2 shadow-xl z-50"
        >
          {note}
        </div>
      )}
    </div>
  );
}
