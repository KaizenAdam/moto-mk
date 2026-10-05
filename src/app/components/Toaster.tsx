"use client";

import { useEffect, useState } from "react";

/**
 * Small confirmations ("Saved", "Listing submitted") shown at the bottom of
 * the screen. Call `toast("Saved")` from any client component; the single
 * <Toaster /> in the root layout shows it. Errors stay next to the thing
 * that failed — toasts are for success, so nothing important is missed if
 * one fades out unread.
 */
const EVENT = "j5-toast";

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: message }));
}

type Item = { id: number; message: string };
let nextId = 0;

export default function Toaster() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const onToast = (e: Event) => {
      const item = { id: nextId++, message: (e as CustomEvent<string>).detail };
      setItems((all) => [...all.slice(-2), item]);
      setTimeout(() => setItems((all) => all.filter((i) => i.id !== item.id)), 3200);
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-5 z-[100] flex flex-col items-center gap-2 px-4"
    >
      {items.map((i) => (
        <div
          key={i.id}
          className="j5-toast flex items-center gap-2 rounded-full border border-gold/60 bg-[#141417]/95 px-4 py-2.5 text-sm font-semibold text-ink shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        >
          <span className="text-gold">✓</span>
          {i.message}
        </div>
      ))}
    </div>
  );
}
