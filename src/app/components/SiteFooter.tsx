import Link from "next/link";
import CookieSettingsLink from "./CookieSettingsLink";
import { CONTACT_EMAIL } from "@/lib/site";

const columns = [
  {
    title: "Buy",
    links: [
      { href: "/bikes", label: "All motorcycles" },
      { href: "/dealers", label: "Dealers" },
      { href: "/parts-gear", label: "Parts & gear" },
    ],
  },
  {
    title: "Ride",
    links: [
      { href: "/service-centres", label: "Service centres" },
      { href: "/events", label: "Events" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/garage", label: "My Garage" },
      { href: "/sell", label: "List your bike" },
    ],
  },
  {
    // Business offers live down here, not in the main nav: the header is for
    // riders buying and selling (Auto Trader keeps its trade side separate too).
    title: "For business",
    links: [
      { href: "/for-business", label: "Just5Up! for business" },
      { href: "/for-business#dealers", label: "Become a dealer" },
      { href: "/for-business#advertise", label: "Advertise with us" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-[#1a1a1c]">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-8 px-5 py-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="col-span-2 md:col-span-1">
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized PNG wordmark */}
          <img src="/brand/wordmark-white.png" width={621} height={168} alt="Just5Up!" className="mb-3 h-10 w-auto" />
          <p className="mb-4 max-w-xs text-sm text-ink-dim">
            North Macedonia&rsquo;s motorcycle marketplace - bikes from riders and verified dealers.
          </p>
          <Link
            href="/sell"
            className="font-display inline-block bg-highlight px-4 py-2 text-sm font-semibold tracking-[.06em] text-[#111] transition hover:brightness-110"
          >
            List your bike free &gt;&gt;&gt;
          </Link>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="font-display mb-3 text-sm font-semibold tracking-wider text-highlight">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink-dim hover:text-highlight">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-5 py-4 text-xs text-grey md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Just5Up! · Every listing is checked before it goes live</p>
          {/* CONTACT_EMAIL is a placeholder until the client gives a real address (src/lib/site.ts). */}
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-highlight hover:underline">
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-highlight hover:underline">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-highlight hover:underline">
                Terms
              </Link>
            </li>
            <li>
              <CookieSettingsLink />
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
