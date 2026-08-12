import ChevronDivider from "./ChevronDivider";

export default function Footer() {
  return (
    <footer className="asphalt text-paper/70 mt-16">
      <ChevronDivider />
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 text-sm">
        <p className="font-display text-lg uppercase tracking-wider text-paper">
          Vozi<span className="text-amber">Moto</span>
        </p>
        <p className="mt-2 text-xs text-steel max-w-[32ch]">
          The specialist marketplace for motorcycles in North Macedonia.
        </p>
      </div>
      <div className="border-t border-tarmac-line px-4 md:px-6 py-4 text-xs text-steel-dark text-center">
        © 2026 VoziMoto — a Kaizen Solutions prototype for North Macedonia.
      </div>
    </footer>
  );
}
