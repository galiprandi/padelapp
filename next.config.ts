const SecurityHeaders = [
  // Reduce risk of clickjacking on every route (including OAuth callback).
  { key: "X-Frame-Options", value: "DENY" },
  // Stop legacy browser content-type sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs (with query params that may carry tokens) to third
  // parties when users click outbound links.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Lock down powerful browser APIs to same-origin only.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Baseline CSP. Allow Google OAuth endpoints, Google avatars, DiceBear and
  // self resources. `unsafe-inline` is required by Next.js inline styles in
  // dev; tighten once shadcn/ui is audited for nonce-based styles in prod.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' data: blob: https://lh3.googleusercontent.com https://api.dicebear.com",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://www.googleapis.com https://identity.googleapis.com",
      "frame-src 'self' https://accounts.google.com",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://accounts.google.com",
    ].join("; "),
  },
];

const nextConfig = {
  cacheComponents: true,
  turbopack: {},
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: SecurityHeaders }];
  },
};

export default nextConfig;
