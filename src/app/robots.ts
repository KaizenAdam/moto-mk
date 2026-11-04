import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Public pages are open to search engines; account and admin pages aren't. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/garage",
        "/sell",
        "/feature",
        "/listings/*/edit",
        "/listings/*/feature",
        "/auth/",
        "/api/",
        "/reset-password",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
