import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: "http://awesome-pixel-api.duckdns.org/api/:path*",
      },
    ];
  },
};

export default nextConfig;
