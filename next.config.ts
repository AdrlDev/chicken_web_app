import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*', // When you request /api/...
        destination: 'https://aedev.cloud/chickenapi/v1/:path*', // Proxy to external API
      },
    ];
  },
};

export default nextConfig;
