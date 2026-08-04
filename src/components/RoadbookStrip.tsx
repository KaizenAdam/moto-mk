const STOPS = ["Tetovo", "Gostivar", "Skopje", "Veles", "Kumanovo", "Prilep", "Bitola", "Ohrid", "Strumica"];

export default function RoadbookStrip() {
  return (
    <div className="overflow-x-auto">
      <div className="flex items-center min-w-max px-1 py-6">
        {STOPS.map((stop, i) => (
          <div key={stop} className="flex items-center">
            <div className="flex flex-col items-center">
              <span className="w-3 h-3 rounded-full bg-amber border-2 border-tarmac" />
              <span className="mt-2 font-data text-xs uppercase tracking-wide text-paper/80 whitespace-nowrap">
                {stop}
              </span>
            </div>
            {i < STOPS.length - 1 && (
              <span className="w-10 md:w-16 h-[2px] bg-steel/50 mx-1 mb-5" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
