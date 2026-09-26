import { getSecurityHeaders } from "./src/lib/security-headers";

const nextConfig = {
  cacheComponents: true,
  turbopack: {},
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    // Avatars come from Google only (lh3.googleusercontent.com).
    // dangerouslyAllowSVG is kept for safety but no SVG sources are
    // currently whitelisted.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: getSecurityHeaders(process.env.NODE_ENV === "development"),
      },
    ];
  },
};

export default nextConfig;
