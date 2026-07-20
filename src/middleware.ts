import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// The full NextAuth instance lives in `src/auth.ts` and uses
// `session.strategy = "database"`. Even though this middleware runs in the
// Node.js runtime in Next.js 16 (where proxy/middleware defaults to Node),
// Auth.js' cookie verification needs the same `AUTH_SECRET`/cookie config as
// the rest of the app. Loading the full NextAuth instance here would cause
// `MissingAdapter` errors if the adapter is not loaded the same way.
//
// Instead of relying on the adapter at the edge, we trust the signed session
// cookie via `getToken`: Auth.js signs the cookie token with `AUTH_SECRET`, so
// we can verify its signature without hitting the database. The full DB-backed
// session is then re-validated in `(app)/layout.tsx` via `auth()`, which
// guarantees defense in depth (this middleware is a perimeter check, not the
// only check).
//
// IMPORTANT: with `strategy: "database"`, Auth.js issues the JWT as an opaque
// session reference (`{ token_type: "SessionToken", sessionToken: "..." }`)
// and the user identity is only resolved when `auth()` queries the DB. In
// edge middleware we cannot reach the DB, so we accept the cookie's existence
// and signature as proof of *having logged in*, then defer user resolution to
// the downstream server code (which will fail-fast and redirect to /login if
// the session row no longer exists).
//
// Public routes (`/`, `/t/[id]`, `/m/[matchId]`, `/j/[playerId]`, `/p/[userId]`,
// `/install`, `/catalog`, `/login`, `/api/auth/*`, `/api/cron/*`) must NEVER be
// listed in `config.matcher`: they are intended to be reachable without a
// session. Keep this list in sync with `MANUAL.md`.

const cookieName =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

export async function middleware(req: Request) {
  const token = await getToken({
    req: req as any,
    secret: process.env.AUTH_SECRET,
    cookieName,
    salt: cookieName,
  });

  if (token) {
    return NextResponse.next();
  }

  const url = new URL("/login", req.url);
  url.searchParams.set("callbackUrl", new URL(req.url).pathname);
  return NextResponse.redirect(url);
}

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
