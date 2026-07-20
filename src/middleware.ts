import { NextResponse } from "next/server";
import NextAuth from "next-auth";

// Re-declare a minimal NextAuth instance only to read the session cookie at the
// edge. The full providers/adapter config stays in `src/auth.ts` (single source
// of truth for DB sessions). Here we don't need providers: we only validate the
// signed session cookie signature to decide whether the request is
// authenticated, and redirect to `/login` otherwise.
//
// Public routes (`/`, `/t/[id]`, `/m/[matchId]`, `/j/[playerId]`, `/p/[userId]`,
// `/install`, `/catalog`, `/login`, `/api/auth/*`, `/api/cron/*`) must NEVER be
// listed in `config.matcher`: they are intended to be reachable without a
// session. Keep this list in sync with `MANUAL.md`.
const { auth } = NextAuth({
  trustHost: true,
  session: { strategy: "database" },
  secret: process.env.AUTH_SECRET,
  providers: [],
  callbacks: {
    // We drive the redirect ourselves so we can send users to `/login` instead
    // of Auth.js' default 401 page.
    authorized: () => true,
  },
});

export default auth((req) => {
  const isAuthenticated = Boolean(req.auth?.user?.id);
  if (isAuthenticated) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: [
    "/me/:path*",
    "/match/:path*",
    "/turnos/:path*",
    "/ranking/:path*",
    "/notifications/:path*",
    "/network/:path*",
  ],
};
