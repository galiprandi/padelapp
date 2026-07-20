// Edge perimeter auth was attempted but disabled.
//
// Auth.js v5 with `session.strategy: "database"` does NOT store a signed JWT
// in the session cookie — it stores the opaque session row UUID in plaintext
// (see `@auth/core/src/lib/actions/callback/index.ts` line ~166). Therefore
// `getToken` from `next-auth/jwt` cannot validate it (it expects an encrypted
// envelope) and would always return null, bouncing every authenticated user
// back to /login in an infinite loop.
//
// Defense-in-depth is preserved inside `(app)/layout.tsx`, `me/profile/page`,
// and every Server Action via the `auth()` helper. Any new route added under
// `/me|turnos|match|ranking|notifications|network` MUST go through that helper
// or reproduce the redirect-to-`/login` pattern. The trade-off is documented
// in `AGENTS.md` § "MVP Scope — Pending (critical for launch)".

import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next();
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
