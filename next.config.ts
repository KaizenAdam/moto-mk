import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // /advertise became the For business page (Nov 2026); keep old links working.
    return [{ source: "/advertise", destination: "/for-business#advertise", permanent: true }];
  },
};

export default nextConfig;
