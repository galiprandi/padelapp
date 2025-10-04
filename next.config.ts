import type { NextConfig } from "next";
import createNextPwa from "next-pwa";

const withPWA = createNextPwa({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default withPWA(nextConfig);
