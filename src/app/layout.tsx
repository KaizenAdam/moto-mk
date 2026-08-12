import type { Metadata } from "next";
import { Oswald, Inter, JetBrains_Mono, Anton, Stardos_Stencil } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { CurrencyProvider } from "@/lib/currency";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Used only on the /listings (Just5Up) page — additive, doesn't affect
// any other route's styling.
const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const stardosStencil = Stardos_Stencil({
  variable: "--font-stardos",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "VoziMoto — Motorcycle Classifieds for North Macedonia",
  description:
    "The specialist marketplace for motorcycles in North Macedonia — buy, sell, and ride with Skopje, Bitola, Ohrid, and beyond.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${oswald.variable} ${inter.variable} ${jetbrainsMono.variable} ${anton.variable} ${stardosStencil.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body">
        <CurrencyProvider>
          <SiteChrome>{children}</SiteChrome>
        </CurrencyProvider>
      </body>
    </html>
  );
}
