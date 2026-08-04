import ListingsBrowser from "@/components/ListingsBrowser";
import ChevronDivider from "@/components/ChevronDivider";

export const metadata = {
  title: "Browse Motorcycles — VoziMoto",
};

export default async function ListingsPage(props: PageProps<"/listings">) {
  const searchParams = await props.searchParams;
  const initialMake = typeof searchParams.make === "string" ? searchParams.make : "";
  const initialStyle = typeof searchParams.style === "string" ? searchParams.style : "";

  return (
    <div>
      <div className="asphalt py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <p className="font-data uppercase tracking-widest text-amber text-xs mb-2">
            Browse
          </p>
          <h1 className="font-display uppercase text-3xl md:text-4xl text-paper">
            Every bike, filtered like a rider would
          </h1>
        </div>
      </div>
      <ChevronDivider subtle />
      <ListingsBrowser initialMake={initialMake} initialStyle={initialStyle} />
    </div>
  );
}
