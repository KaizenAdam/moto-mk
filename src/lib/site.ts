/**
 * The site's public address, for share links and preview images. Set
 * NEXT_PUBLIC_SITE_URL once there's a real domain; until then Vercel's own
 * production address is used (VERCEL_PROJECT_PRODUCTION_URL is set by
 * Vercel automatically).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_NAME = "Just5Up!";
export const SITE_DESCRIPTION =
  "Motorcycles for sale across North Macedonia — from riders and verified dealers. Free to list.";
