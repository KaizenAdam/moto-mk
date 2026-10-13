import type { ReactNode } from "react";

/** The dashed box shown where a list has nothing in it. */
export default function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[10px] border border-dashed border-line px-5 py-10 text-center text-sm text-ink-dim">
      {children}
    </div>
  );
}
