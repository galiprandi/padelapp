# AGENTS – PadelApp

Context and responsibilities for automated agents or contributors working on **PadelApp**.

## 1. Purpose
- Build **PadelApp**, a PWA mobile-first app to register matches, organize open turns, and maintain player rankings/reputation.
- MVP with minimal friction: Google-only login, simple turn/match registration, dynamic ranking by level and reputation.

## 2. Key Principles
- **Mobile-first**: design for smartphones before desktop.
- **Low friction**: short flows, minimal data, clear actions.
- **Link distribution**: every turn or match generates shareable URLs for instant access after Google login.
- **Competitive transparency**: visible ranking and reputation with standard categories (1 pro – 8 beginner).

## 3. MVP Scope
- Google-only login (NextAuth).
- Open turn creation with slots and suggested level.
- Open enrollment until turn start.
- Match registration linked to turns, with four-player confirmation.
- Individual ranking; reputation based on attendance.
- Installable PWA with push notifications (Firebase) on short roadmap.

## 4. Tech Stack
- **Frontend**: Next.js 15 (App Router, TypeScript, Server Components/Actions).
- **UI**: Tailwind CSS + shadcn/ui (yellow theme). See `DESIGN.md` for design policy.
- **Data**: Prisma + PostgreSQL (local dev via Docker, production via Supabase).
- **Auth**: NextAuth with Google OAuth.
- **Hosting**: Vercel, domain `padelapp.app`.
- **Notifications**: Firebase Cloud Messaging (post-MVP).

## 5. Agent Rules
1. Stay consistent with MVP vision; defer out-of-scope features (matchmaking, social network).
2. Follow `DESIGN.md` design maxims strictly — no V9+ patterns, no ambient lighting, no glassmorphism.
3. Use shadcn/ui components with custom yellow palette.
4. Document assumptions in `README.md` or specific files.
5. Validate critical flows work on mobile and support PWA installation.
6. Keep code, comments, and URLs in English.
7. Prefer native mobile form inputs for usability over visual design.
8. Maintain view/section specs in `specs/` with status (Not Implemented / Implemented).
9. Update component catalog (`/app/catalog`) when designing or refactoring reusable components.
10. Prefer Server Components and Server Actions; use Client Components only when browser interactivity requires it.

## 6. Current State

### Implemented
- **Minimal Design Cleanup**: Core shared components (`BottomNav`, `TopBar`, `RankingSearch`, `ManageSlotModal`, `TurnCard`, `PlayerPreview`, `PairPreview`, `RankingSearch`, `ToastProvider`, `PlayerAvatar`, `Badge`, `ShareButton`, `Switch`, `PwaInstallBanner`) refactored to Minimal Design standards.
- Google OAuth login with NextAuth + Prisma adapter.
- Dashboard (`/me`) with agenda, pending actions, and recent results.
- Turn management: list (`/turnos`), create (`/turnos/nuevo`), edit (`/turnos/[id]/editar`), public view (`/t/[id]`).
- Match management: list (`/match`), create (`/match/new`), detail (`/match/[matchId]`), edit (`/match/[matchId]/edit`), result entry (`/match/[matchId]/result`).
- Public match invitation (`/m/[matchId]`), direct join (`/j/[playerId]`), public player profile (`/p/[userId]`).
- Ranking system (`/ranking`) with score formula, attendance reputation, and temporal decay.
- Profile management (`/me/profile`) with alias and level selection.
- Notifications center (`/notifications`) for pending match actions.
- PWA installable with install guide (`/install`).
- Component catalog (`/catalog`) fully migrated to Minimal Design System.

### Design System
- Clean minimal UI per `DESIGN.md`.
- All redesigned pages use plain `<h1>`/`<p>` headers, standard Tailwind sizes, no decorative effects.
- `PageHeader` component removed; all views use semantic HTML for headers.
- Dashboard and main list views (`/me`, `/turnos`, `/match`) refined for UX consistency and accessibility (aria-labels, color standards for W/L).

### Architecture
- **Prisma + PostgreSQL**: single source of truth.
- **Server Actions**: all data mutations.
- **Centralized queries**: `src/lib/match-queries.ts` for consistent reads.
- **Ranking formula**: `score = 1000 + (wins * 15) + (streak * 5) + (setsWonBonus)`.
- **Tiebreak**: Score > Attendance > Wins > Recency.
- **Decay**: x0.5 after 60 days inactive, x0.25 after 120 days.
- **Confirmation**: at least one player per team must confirm result.
