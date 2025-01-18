import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // @ts-ignore - bypass typing error for appDir
    appDir: true,
  },
};

export default nextConfig;
