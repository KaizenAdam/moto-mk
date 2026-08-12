import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import CurrencyToggle from "./CurrencyToggle";
import BikeGlyph from "./BikeGlyph";

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

        <div className="flex items-center gap-3">
          <CurrencyToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
