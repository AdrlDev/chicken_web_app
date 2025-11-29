import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/:path*", // When you request /api/...
        destination: "https://aedev.cloud/chickenapi/v1/:path*", // Proxy to external API
      },
    ];
  },
  eslint: {
    // ⭐️ FIX: Remove deprecated options like `useEslintrc` and `extensions`.
    // We only keep `ignoreDuringBuilds` if you prefer to run linting separately.
    ignoreDuringBuilds: true, // Recommended if you run linting before/after build
  },
};

export default nextConfig;
