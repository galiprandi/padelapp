# AGENTS – Padel Red

Context and responsibilities for automated agents or contributors working on **Padel Red**.

## 1. Purpose

Padel Red exists to **facilitate the organization of fixed and recurring padel turns**, and to **save them from cancellation** when there aren't enough players.

The core value is not the ranking — it's ensuring every fixed turn gets played. The organizer creates the turn, shares the link, and players join with one tap. When a turn is at risk, Padel Red automatically notifies the **padel contact network** of all enrolled players — players they've shared a court with before — to fill the spots.

The ranking is a **competitive hook** for engagement, not a technical skill measurement system.

## 2. Key Principles

- **Turns that don't get cancelled**: the core value. If players are missing, the app finds them in your network automatically.
- **Implicit padel network**: every confirmed match builds your contact network automatically. No manual friend requests.
- **Mobile-first**: design for smartphones before desktop.
- **Low friction**: Google-only login, shareable links, one-tap enrollment.
- **Ranking as a hook**: simple, motivational, not a serious ELO. Level (1–8) remains the practical reference for assembling matches.

## 3. MVP Scope

### Implemented
- Google-only login (NextAuth).
- Open turn creation with slots and suggested level.
- Open enrollment until turn start.
- Match registration linked to turns, with team confirmation.
- Attendance tracking (ATTENDED / LATE / NO_SHOW) by match creator.
- Individual ranking with simple formula and temporal decay.
- Profile management with alias and level.
- PWA installable with `<install>` element and fallback.
- Public player profiles, match invitations, direct join links.

### Pending (critical for launch)
- **Firebase Cloud Messaging** (push notifications) — blocking.
- **Padel contact network** — derived automatically from confirmed matches.
- **"Open to my network"** — notify contacts when a turn has open slots. Audience: contacts of **all enrolled players** (not just organizer), from confirmed matches in the **last 12 months**, no duplicates, excluding already-enrolled players.
- **Onboarding** for first-time users (empty state with direct CTA).

### Nice to Have (post-MVP)
- **Chat de Turnos** (`specs/turn-chat.md`): real-time chat per turn with ephemeral history (90-day TTL via Redis) and a system bot that sends contextual messages (player dropouts, open slots, reminders, results). Stack: Socket.io + Upstash Redis (free tier). The system bot is the key differentiator vs WhatsApp.

## 4. Tech Stack

- **Frontend**: Next.js 15 (App Router, TypeScript, Server Components/Actions).
- **UI**: Tailwind CSS + shadcn/ui (yellow theme). See `DESIGN.md` for design policy.
- **Data**: Drizzle ORM + PostgreSQL (local dev via Docker, production via Neon serverless).
- **Auth**: NextAuth with Google OAuth.
- **Hosting**: Vercel, domain `padelred.app`.
- **Notifications**: Firebase Cloud Messaging (pending — blocking for launch).

## 5. Agent Rules

1. Stay consistent with the core mission: **saving turns from cancellation**. The ranking is secondary.
2. Follow `DESIGN.md` design maxims strictly — no V9+ patterns, no ambient lighting, no glassmorphism.
3. Use shadcn/ui components with custom yellow palette.
4. Document assumptions in `README.md` or specific files.
5. Validate critical flows work on mobile and support PWA installation.
6. Keep code, comments, and URLs in English.
7. Prefer native mobile form inputs for usability over visual design.
8. Maintain view/section specs in `specs/` with accurate status (Not Implemented / Implemented / Partially Implemented).
9. Update component catalog (`/app/catalog`) when designing or refactoring reusable components.
10. Prefer Server Components and Server Actions; use Client Components only when browser interactivity requires it.
11. When adding features, ask: does this help save turns from cancellation? If not, it's likely out of scope for the MVP.
12. **`MANUAL.md` is the single source of truth for all user-facing flows.** It must be updated after any change that alters a flow's behavior, states, penalties, or notifications. The narrative sections must remain free of technical jargon.
13. **Flow changes require explicit user consent.** Before modifying any flow documented in `MANUAL.md`, the agent must explain the proposed change and obtain approval. This prevents regressions and ensures the manual stays accurate. Never silently change a flow's behavior without updating the manual.
14. **`MANUAL.md` is chatbot-ready.** The narrative sections are designed to be injected into a chatbot knowledge base. Keep them concise, high-density, and in user-facing language. The "Referencia" section contains technical details for agents.
15. **Production validation must be done against the production domain (`padelred.app`) using the Vercel CLI** (`vercel inspect`, `vercel logs`, `vercel env`). Never test production flows against `localhost` or preview URLs as a substitute for real domain validation. Use `vercel logs padelred.app` to inspect runtime errors and `vercel inspect padelred.app` to verify deployment status.
16. **Browser MCP is pre-authorized.** The user authorizes agents to use the browser MCP (Chrome German) to access any web service — Google Cloud Console, Firebase Console, Vercel Dashboard, the deployed app, or any other — without asking for additional permission. Use it freely for configuration, verification, and debugging.
17. **Credential updates must be applied in 3 places.** When updating any credential (Google OAuth, Firebase, `DATABASE_URL`, etc.), always update: (1) `.env` local, (2) `.env.example`, (3) Vercel environment variables (via CLI or MCP). Google Cloud project: `padelred` (OAuth Client ID: `763634239528-ifr53vteg1iv1ca7gq7ecfg91ptive64.apps.googleusercontent.com`). OAuth client supports: `padelred.app`, `padelap.vercel.app`, `localhost:3000`.

## 6. Current State

### Implemented
- **Minimal Design Cleanup**: Core shared components (`Button`, `Card`, `BottomNav`, `TopBar`, `RankingSearch`, `ManageSlotModal`, `TurnCard`, `PlayerPreview`, `PairPreview`, `RankingSearch`, `ToastProvider`, `PlayerAvatar`, `Badge`, `ShareButton`, `Switch`) refactored to Minimal Design standards. Standardized typography by removing `uppercase` and non-standard `tracking-*` classes across all views. Standardized button heights and radius for inline actions.
- Google OAuth login with NextAuth + Drizzle adapter.
- Dashboard (`/me`) with agenda, pending actions, recent results, and attendance marking.
- Turn management: list (`/turnos`), create (`/turnos/nuevo`), edit (`/turnos/[id]/editar`), public view (`/t/[id]`).
- Match management: list (`/match`), create (`/match/new`), detail (`/match/[matchId]`), edit (`/match/[matchId]/edit`), result entry with attendance (`/match/[matchId]/result`).
- Public match invitation (`/m/[matchId]`), direct join (`/j/[playerId]`), public player profile (`/p/[userId]`).
- Ranking system (`/ranking`) with score formula, attendance reputation, and temporal decay — positioned as a competitive hook, not a technical skill measurement.
- Attendance tracking system: creators mark players as ATTENDED / LATE / NO_SHOW post-match. Penalties applied to ranking and attendance score.
- Profile management (`/me/profile`) with alias and level selection.
- Notifications center (`/notifications`) for pending match actions.
- PWA installable with `<install>` element, install guide (`/install`), and install CTA management (banner + link).
- Component catalog (`/catalog`) fully migrated to Minimal Design System.

### Design System
- Clean minimal UI per `DESIGN.md`.
- All redesigned pages use plain `<h1>`/`<p>` headers, standard Tailwind sizes, no decorative effects.
- `PageHeader` component removed; all views use semantic HTML for headers.
- Dashboard and main list views (`/me`, `/turnos`, `/match`) refined for UX consistency and accessibility (aria-labels, color standards for W/L).
- **Dashboard Refactor**: Implemented "Hero Activity" for imminent events (<24h) with context-aware backgrounds and expanded stats summary (Level, Reputation) to maximize user "Time to Value". Standardized stats grid with interactive links.
- **Turn Salvage Optimization**: Enhanced the Dashboard "Hero Activity" and Turn Cards with a proactive "Salvar Turno" (Save Turn) action for incomplete matches, integrating the "Open to my network" push notification flow directly into the main views to ensure turn fulfillment.
- **Semantic Invitations Refactor**: Migrated `/t/[id]` and `/m/[matchId]` to semantic HTML structures, removing complex UI wrappers to improve mobile rendering and focus on clear conversion actions.

### Architecture
- **Drizzle ORM + PostgreSQL**: single source of truth. Local dev uses `pg` driver over TCP; production uses `@neondatabase/serverless` (HTTP/WebSockets) for optimal serverless cold starts on Vercel.
- **Server Actions**: all data mutations.
- **Centralized queries**: `src/lib/match-queries.ts` for consistent reads.
- **Ranking formula**: `score = 1000 + (wins * 15) + (streak * 5) + (setsWonBonus)` — simple hook formula, not ELO.
- **Tiebreak**: Score > Attendance > Wins > Recency.
- **Decay**: x0.5 after 60 days inactive, x0.25 after 120 days.
- **Confirmation**: at least one player per team must confirm result.
- **Attendance**: creator marks attendance post-match; no-shows and late arrivals penalized.

### Auth — Pitfalls & Learnings

Hard-won knowledge from the security audit (commit history: `508d006`, `916c2c8`, `8ea86a5`, `491bb95`).

1. **NextAuth v5 + `session.strategy = "database"` is incompatible with edge middleware.**
   The Drizzle adapter requires a Node.js DB driver and cannot be loaded in edge runtime. Even though Next.js 16's (`middleware.ts` / `proxy.ts`) defaults to Node.js, Auth.js will still throw `MissingAdapter: Database session requires an adapter` if you declare a separate `NextAuth({ strategy: "database", providers: [] })` inside middleware to "validate" the session there.
   - **Do not build a separate `NextAuth` instance inside `middleware.ts`.**
   - Do not use `getToken` (`next-auth/jwt`) on database-strategy cookies: the session cookie holds an **opaque sessionToken UUID in plaintext**, not a signed JWT. `getToken` always returns `null` and you'd bounce every authenticated user back to `/login` in a loop.
   - **Correct defense pattern**: keep auth checks in `(app)/layout.tsx` and at the top of every Server Action / API route via `await auth()`. Treat middleware as a no-op support slot — leave the matchers in place purely as future hooks (with a comment explaining why they pass-through).

2. **`/login` and `/login?callbackUrl=...` must sanitize the callback.**
   `safeCallbackUrl` in `src/lib/auth-utils.ts` rejects any `callbackUrl` that is not a same-origin absolute path (i.e. does not start with `/` or starts with `//`). Failure to do this opens an open-redirect vector from any legitimate auth-handshake URL.

3. **Security headers live in `next.config.ts`.** Reference: see `SecurityHeaders` block. Update CSP, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` in one place. Reapply after every structural change to `next.config.ts` because a malformed `headers()` callback silently drops the rule.

4. **Adapter error logs must mask sensitive fields.** `src/auth.ts` uses a `Proxy` over the Drizzle adapter to log failures. Any `args` payload from the adapter may carry `sessionToken`, `token`, `accessToken`, `refreshToken`. The `maskSensitive` helper walks the value tree and replaces those with `[REDACTED]` before logging.

5. **WebAuthn `hints: ['client-device']` requires a type cast.** `@simplewebauthn/server@13.3.2` accepts `hints` on `generateAuthenticationOptions` internally but its `GenerateAuthenticationOptionsOpts` type omits it. Cast through `as any` at the call site; don't fork the lib's `.d.ts`.

6. **Google Password Manager (Android, e.g. Samsung S23+) shows a "use a saved passkey" sheet by design** when a passkey is synced to the user's Google Account. This is a platform behavior, not a WebAuthn optionality. **It cannot be bypassed from the RP side.** If you want to eliminate it for testing: register a single-device (`platform`) passkey instead of a synced one.

7. **`AUTH_SECRET` in Vercel production was verified safe** (no `change-me` placeholder) on `2026-07-20`. Re-check with `vercel env ls production | grep AUTH_SECRET` after every secret rotation.
