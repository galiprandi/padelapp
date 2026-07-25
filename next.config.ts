const SecurityHeaders = (isDev: boolean) => [
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
  // Baseline CSP. Allow Google OAuth endpoints, Google avatars and
  // self resources. `unsafe-inline` is required by Next.js inline styles in
  // dev; tighten once shadcn/ui is audited for nonce-based styles in prod.
  // `unsafe-eval` is required by React in dev mode for stack reconstruction;
  // never enabled in production.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' data: blob: https://lh3.googleusercontent.com",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://va.vercel-scripts.com`,
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://www.googleapis.com https://identity.googleapis.com https://firebaseinstallations.googleapis.com https://fcm.googleapis.com https://fcmregistrations.googleapis.com https://va.vercel-scripts.com",
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
    return [{ source: "/(.*)", headers: SecurityHeaders(process.env.NODE_ENV === "development") }];
  },
};

export default nextConfig;
