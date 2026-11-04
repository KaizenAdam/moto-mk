import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { listActive } from "@/lib/data/listings";
import { listActiveDealers } from "@/lib/data/dealers";
import { SITE_URL } from "@/lib/site";

/**
 * Every public page for search engines: the section pages, each live
 * listing and each live dealer storefront. Built per request (RLS only
 * returns live rows), so it's always current.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const [listings, dealers] = await Promise.all([listActive(supabase), listActiveDealers(supabase)]);

  const pages = ["", "/bikes", "/dealers", "/parts-gear", "/service-centres", "/events", "/for-business"].map(
    (path) => ({ url: `${SITE_URL}${path}`, changeFrequency: "daily" as const, priority: path === "" ? 1 : 0.8 }),
  );

  return [
    ...pages,
    ...listings.map((l) => ({
      url: `${SITE_URL}/listings/${l.id}`,
      lastModified: l.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...dealers.map((d) => ({
      url: `${SITE_URL}/dealers/${d.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
