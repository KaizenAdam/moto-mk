import type { NextConfig } from "next";

// Basic hardening on every response. No full script CSP yet: Next's inline
// scripts would need nonces, so that's a separate piece of work.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // /advertise became the For business page (Nov 2026); keep old links working.
    return [{ source: "/advertise", destination: "/for-business#advertise", permanent: true }];
  },
};

export default nextConfig;
