import SellForm from "@/components/SellForm";

export const metadata = {
  title: "List Your Bike — VoziMoto",
};

export default function SellPage() {
  return (
    <div>
      <div className="asphalt py-10 md:py-14">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <p className="font-data uppercase tracking-widest text-amber text-xs mb-2">
            Sell
          </p>
          <h1 className="font-display uppercase text-3xl md:text-4xl text-paper">
            List your bike in minutes
          </h1>
          <p className="text-paper/70 mt-3 max-w-xl text-sm">
            Free to list, rider-specific fields, and a live preview so you know
            exactly what buyers will see.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 md:px-6 py-12 md:py-16">
        <SellForm />
      </div>
    </div>
  );
}
