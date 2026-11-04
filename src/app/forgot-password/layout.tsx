import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page itself is a client component, so its title lives here.
export const metadata: Metadata = { title: "Forgot your password", robots: { index: false } };

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
