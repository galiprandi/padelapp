# AGENTS – PadelApp

Context and responsibilities for automated agents or contributors working on **PadelApp**.

## 1. Purpose

PadelApp exists to **facilitate the organization of fixed and recurring padel turns**, and to **save them from cancellation** when there aren't enough players.

The core value is not the ranking — it's ensuring every fixed turn gets played. The organizer creates the turn, shares the link, and players join with one tap. When a turn is at risk, PadelApp automatically notifies the organizer's **padel contact network** — players they've shared a court with before — to fill the spots.

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

## 4. Tech Stack

- **Frontend**: Next.js 15 (App Router, TypeScript, Server Components/Actions).
- **UI**: Tailwind CSS + shadcn/ui (yellow theme). See `DESIGN.md` for design policy.
- **Data**: Drizzle ORM + PostgreSQL (local dev via Docker, production via Neon serverless).
- **Auth**: NextAuth with Google OAuth.
- **Hosting**: Vercel, domain `padelapp.app`.
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
