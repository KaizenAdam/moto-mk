"use client";

import { createContext, useContext, useMemo, useState } from "react";

interface SavedContextValue {
  savedSlugs: Set<string>;
  isSaved: (slug: string) => boolean;
  toggleSaved: (slug: string) => void;
  count: number;
}

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [savedSlugs, setSavedSlugs] = useState<Set<string>>(new Set());

  const value = useMemo<SavedContextValue>(() => {
    const toggleSaved = (slug: string) => {
      setSavedSlugs((prev) => {
        const next = new Set(prev);
        if (next.has(slug)) next.delete(slug);
        else next.add(slug);
        return next;
      });
    };
    return {
      savedSlugs,
      isSaved: (slug: string) => savedSlugs.has(slug),
      toggleSaved,
      count: savedSlugs.size,
    };
  }, [savedSlugs]);

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
