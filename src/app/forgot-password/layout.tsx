import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getI18n } from "@/lib/i18n/server";

// The page itself is a client component, so its title lives here.
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.forgotTitle, robots: { index: false } };
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
