import Link from "next/link";
import ChevronDivider from "./ChevronDivider";

export default function Footer() {
  return (
    <footer className="asphalt text-paper/70 mt-16">
      <ChevronDivider />
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-lg uppercase tracking-wider text-paper">
            Vozi<span className="text-amber">Moto</span>
          </p>
          <p className="mt-2 text-xs text-steel max-w-[22ch]">
            The specialist marketplace for motorcycles in North Macedonia.
          </p>
        </div>
        <div>
          <p className="font-data uppercase text-xs tracking-widest text-steel mb-2">Marketplace</p>
          <ul className="space-y-1.5">
            <li><Link href="/listings" className="hover:text-amber">Browse listings</Link></li>
            <li><Link href="/sell" className="hover:text-amber">Sell your bike</Link></li>
            <li><Link href="/dealers/mototech-skopje" className="hover:text-amber">Dealer showrooms</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-data uppercase text-xs tracking-widest text-steel mb-2">Community</p>
          <ul className="space-y-1.5">
            <li><Link href="/events" className="hover:text-amber">Sobiri & rallies</Link></li>
            <li><Link href="/events" className="hover:text-amber">Group rides</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-data uppercase text-xs tracking-widest text-steel mb-2">Language</p>
          <ul className="space-y-1.5">
            <li>Македонски <span className="text-amber text-xs">(soon)</span></li>
            <li>Shqip <span className="text-amber text-xs">(soon)</span></li>
            <li>English</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-tarmac-line px-4 md:px-6 py-4 text-xs text-steel-dark text-center">
        © 2026 VoziMoto — a Kaizen Solutions prototype for North Macedonia.
      </div>
    </footer>
  );
}
