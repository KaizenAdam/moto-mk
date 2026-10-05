import type { Metadata, Viewport } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import Toaster from "@/app/components/Toaster";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — North Macedonia's motorcycle marketplace`, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: { siteName: SITE_NAME, type: "website", locale: "en_GB" },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [{ url: "/brand/icon-gold-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/brand/icon-gold-180.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = { themeColor: "#0b0b0d" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-black">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <Toaster />
      </body>
    </html>
  );
}
