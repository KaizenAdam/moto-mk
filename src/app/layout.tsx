import type { Metadata, Viewport } from "next";
import { Anton, DM_Sans, Oswald } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import Toaster from "@/app/components/Toaster";
import CookieBar from "@/app/components/CookieBar";
import { I18nProvider } from "@/app/components/I18nProvider";
import { getI18n } from "@/lib/i18n/server";
import { clientDictionary } from "@/lib/i18n/dictionaries";
import { LOCALE_TAGS } from "@/lib/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.defaultTitle, template: `%s - ${SITE_NAME}` },
    description: t.meta.description,
    applicationName: SITE_NAME,
    openGraph: { siteName: SITE_NAME, type: "website", locale: LOCALE_TAGS[locale].replace("-", "_") },
    twitter: { card: "summary_large_image" },
    icons: {
      icon: [{ url: "/brand/icon-moto-hut-32.png", sizes: "32x32", type: "image/png" }],
      apple: [{ url: "/brand/icon-moto-hut-180.png", sizes: "180x180" }],
    },
  };
}

// Brand fonts are Impact (headings, buttons, badges) and Cerebri Sans (body).
// These are their free stand-ins for visitors who don't have them: Anton for
// Impact, Oswald for Cyrillic headings (Anton has none), DM Sans for body.
const anton = Anton({ weight: "400", subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-anton" });
const oswald = Oswald({ subsets: ["cyrillic"], display: "swap", variable: "--font-oswald" });
const dmSans = DM_Sans({ subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-dm-sans" });

export const viewport: Viewport = { themeColor: "#1a1512" };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale, t } = await getI18n();
  return (
    <html lang={LOCALE_TAGS[locale]} className={`${anton.variable} ${oswald.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-black">
        <I18nProvider locale={locale} t={clientDictionary(t)}>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
          <Toaster />
          <CookieBar />
        </I18nProvider>
      </body>
    </html>
  );
}
