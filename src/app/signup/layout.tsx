import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page itself is a client component, so its title lives here.
export const metadata: Metadata = { title: "Sign up", robots: { index: false } };

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
