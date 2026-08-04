import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import CurrencyToggle from "./CurrencyToggle";
import BikeGlyph from "./BikeGlyph";

const NAV = [
  { href: "/listings", label: "Browse" },
  { href: "/events", label: "Sobiri & Events" },
  { href: "/dealers/mototech-skopje", label: "Dealers" },
  { href: "/sell", label: "Sell your bike" },
];

export default function Header() {
  return (
    <header className="asphalt sticky top-0 z-40 border-b border-tarmac-line">
      <div className="mx-auto max-w-7xl px-4 md:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 group">
          <BikeGlyph className="w-8 h-8 text-amber" />
          <span className="font-display text-xl uppercase tracking-wider text-paper">
            Vozi<span className="text-amber">Moto</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-body text-paper/80 hover:text-amber transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <CurrencyToggle />
          <LanguageSwitcher />
          <Link
            href="/sell"
            className="hidden sm:inline-flex items-center rounded-md bg-rally text-paper text-sm font-display uppercase tracking-wide px-3 py-2 hover:bg-amber hover:text-tarmac transition-colors"
          >
            + List a bike
          </Link>
        </div>
      </div>
      <nav className="md:hidden flex items-center gap-4 px-4 pb-3 overflow-x-auto">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-xs font-body whitespace-nowrap text-paper/80 hover:text-amber transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
