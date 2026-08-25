export default function Home() {
  return (
    <section
      className="border-b border-line px-5 py-9"
      style={{
        background:
          "radial-gradient(circle at 80% 0%, rgba(193,39,45,.18), transparent 55%), radial-gradient(circle at 10% 100%, rgba(212,175,55,.12), transparent 50%), #0e0e11",
      }}
    >
      <div className="mx-auto max-w-[1280px]">
        <h1 className="font-display mb-1.5 text-3xl">
          Find your next ride in <em className="not-italic text-gold">North Macedonia</em>
        </h1>
        <p className="mb-4 text-sm text-ink-dim">
          Motorcycles, gear and parts — from riders and trusted dealers across Skopje, Ohrid,
          Bitola and beyond.
        </p>
        <form action="/listings" method="GET" className="flex gap-2.5 rounded-lg border border-line bg-panel p-2">
          <input
            type="text"
            name="search"
            placeholder="Search make, model, e.g. Yamaha R6…"
            className="flex-1 bg-transparent px-2.5 py-2 text-[15px] text-ink outline-none placeholder:text-[#6f6f76]"
          />
          <button
            type="submit"
            className="rounded-md bg-gradient-to-br from-gold-bright to-gold px-[18px] py-[9px] text-[13px] font-bold tracking-wide text-[#141414] uppercase shadow-[0_2px_10px_rgba(212,175,55,0.25)] transition hover:brightness-110"
          >
            Search
          </button>
        </form>
      </div>
    </section>
  );
}
