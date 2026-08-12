import Just5UpListingsBrowser from "@/components/just5up/Just5UpListingsBrowser";
import { j5u } from "@/lib/just5up-theme";

export const metadata = {
  title: "Browse Bikes — Just5Up!",
};

export default async function ListingsPage(props: PageProps<"/listings">) {
  const searchParams = await props.searchParams;
  const initialMake = typeof searchParams.make === "string" ? searchParams.make : "";
  const initialStyle = typeof searchParams.style === "string" ? searchParams.style : "";

  return (
    <div style={{ background: j5u.bg, minHeight: "100vh" }}>
      <Just5UpListingsBrowser initialMake={initialMake} initialStyle={initialStyle} />
    </div>
  );
}
