import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ⭐️ FIX: Remove deprecated options like `useEslintrc` and `extensions`.
    // We only keep `ignoreDuringBuilds` if you prefer to run linting separately.
    ignoreDuringBuilds: true, // Recommended if you run linting before/after build
  },
};

export default nextConfig;
