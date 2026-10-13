import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

// /listings has moved to /bikes (the bike search page). Redirect
// rather than duplicate the page at two URLs, preserving any filters/search
// so old links and bookmarks still work.
export default async function ListingsRedirect({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    const v = Array.isArray(value) ? value[0] : value;
    if (v) params.set(key, v);
  }
  const query = params.toString();
  redirect(query ? `/bikes?${query}` : "/bikes");
}
