import Link from "next/link";
import { button } from "./ui";

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
      { href: "/garage#storefront", label: "Become a dealer" },
      { href: "/advertise", label: "Advertise with us" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-[#1a1a1c]">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-8 px-5 py-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="col-span-2 md:col-span-1">
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized PNG wordmark */}
          <img src="/brand/wordmark-white.png" width={621} height={168} alt="Just5Up!" className="mb-3 h-10 w-auto" />
          <p className="mb-4 max-w-xs text-sm text-ink-dim">
            North Macedonia&rsquo;s motorcycle marketplace — bikes from riders and verified dealers.
          </p>
          <Link href="/sell" className={button("primary", "sm")}>
            + List your bike free
          </Link>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="font-display mb-3 text-sm font-semibold tracking-wider text-gold">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink-dim hover:text-gold-bright">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line px-5 py-4 text-center text-xs text-grey">
        © {new Date().getFullYear()} Just5Up! · Every listing is checked before it goes live
      </div>
    </footer>
  );
}
