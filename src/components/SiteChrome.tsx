"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import Just5UpHeader from "./just5up/Just5UpHeader";
import Just5UpFooter from "./just5up/Just5UpFooter";
import { SavedProvider } from "@/lib/just5up-saved";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Scoped intentionally to the browse/listings page only — detail pages,
  // events, dealers, and sell remain on the VoziMoto chrome, untouched.
  const isJust5Up = pathname === "/listings";

  if (isJust5Up) {
    return (
      <SavedProvider>
        <Just5UpHeader />
        <main className="flex-1">{children}</main>
        <Just5UpFooter />
      </SavedProvider>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
