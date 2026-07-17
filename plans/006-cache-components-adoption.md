# Plan 006: Upgrade to Next.js 16.3+ and adopt Cache Components

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 17cebfa..HEAD -- next.config.ts package.json src/app/(app)/layout.tsx src/app/(app)/match/page.tsx src/app/page.tsx`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: 001 (loading.tsx), 002 (non-blocking layout), 005 (data caching)
- **Category**: perf
- **Planned at**: commit `17cebfa`, 2026-07-17

## Why this matters

Plans 001-005 lay the groundwork (skeletons, non-blocking layout, data caching), but the app is still **fully dynamic** — every page renders on the server at request time. Next.js 16.3+ introduces **Cache Components** (`cacheComponents: true`), which enables **Partial Prerendering (PPR)**: the static shell of each route (layout, navigation, headers, skeleton shapes) is prerendered at build time and served from the CDN edge, while only the dynamic data streams in. This is the single biggest performance win available: navigation between pages becomes **instant** because the shell is already in the browser.

The app already has the infrastructure for this — `revalidateTag` calls exist for `"ranking"`, `"matches"`, and `"turns"` (Plan 005 connects them to `unstable_cache`). Cache Components makes the shell itself static, composing with the data cache for a fully optimized experience.

This is a **Large** plan because it involves a framework upgrade, config migration, and resolving all blocking-route errors that the new validation surfaces.

## Current state

**Next.js version**: 16.2.6 (latest stable is 16.2.10). Cache Components requires **16.3+** — the `cacheComponents` top-level config key, `export const instant`, and the `cache-components-instant-false` codemod all land in 16.3.

**`next.config.ts`** (after Plan 003 removes `ignoreBuildErrors`):

```ts
const nextConfig = {
  turbopack: {},
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
};

export default nextConfig;
```

**Incompatible segment configs** (must be migrated before enabling `cacheComponents`):

| File | Export | Migration |
|------|--------|-----------|
| `src/app/(app)/match/page.tsx:10` | `export const dynamic = "force-dynamic"` | Remove — Plan 005's caching replaces this. If the page still blocks, use `export const instant = false` as a temporary opt-out. |
| `src/app/page.tsx:7` | `export const dynamic = "force-dynamic"` | Remove or translate to `instant = false`. |

**Sync-IO calls** (`new Date()`, `Date.now()`) in app routes — these block the build even with `instant = false`:

| File:line | Call | Fix |
|-----------|------|-----|
| `src/app/(app)/me/page.tsx:25` | `const now = new Date()` | Move into a `<Suspense>`-wrapped child component, or use `await connection()` |
| `src/app/(app)/turnos/page.tsx:15` | `date: { gte: new Date() }` | Already handled by Plan 005's `getCachedOpenTurns` (the `new Date()` is inside `unstable_cache`, evaluated at cache-write time) |
| `src/app/(app)/match/[matchId]/result/page.tsx:188` | `new Date() > oneHourAfterMatch` | This is a client component (`"use client"`) — sync-IO in client components does NOT block the build |
| `src/lib/match-queries.ts:63,78,89` | `new Date()`, `Date.now()` | Inside query functions called from server components. These block if called at render time outside `<Suspense>`. After Plan 005, some are inside `unstable_cache` (safe). Others need wrapping. |
| `src/lib/padel-contacts.ts:22,125` | `new Date()` | Inside server action functions — server actions are not prerendered, so these are safe. |
| `src/lib/utils.ts:9,18,28` | `new Date()` | `getGreeting()` is called in `me/page.tsx` at render time. Needs to move into `<Suspense>` or be cached. |

**Existing `loading.tsx` files** (after Plan 001): 7 files in `src/app/(app)/` — these provide the `<Suspense>` fallbacks that Cache Components needs.

**Existing `error.tsx` files** (after Plan 004): 2 files — these are client components and don't affect prerendering.

**Repo conventions:**
- App Router, Server Components by default, Client Components only when needed.
- `auth()` from `@/auth` reads cookies → makes routes dynamic. This is expected and correct — the auth check stays in the layout, wrapped in `<Suspense>` for the parts that can be static.
- `revalidateTag` is already called after all mutations (ranking, matches, turns).
- `unstable_cache` with `revalidateTags` is set up by Plan 005.

**Skill available**: `.agents/skills/next-cache-components-adoption/SKILL.md` — this skill walks through the exact adoption process. The executor should invoke it if available.

## Commands you will need

| Purpose | Command | Expected on success |
|--------|---------|---------------------|
| Install | `npm install` | exit 0 |
| Typecheck | `npx tsc --noEmit` | exit 0, no errors |
| Lint | `npm run lint` | exit 0 |
| Build | `npm run build` | exit 0, builds successfully |
| Dev server | `npm run dev` | starts on localhost:3000 |
| Next.js version | `npx next --version` | ≥ 16.3.0 |

## Scope

**In scope** (files you should modify):
- `package.json` — upgrade `next` and `eslint-config-next` to 16.3+
- `next.config.ts` — add `cacheComponents: true`
- `src/app/(app)/match/page.tsx` — remove `export const dynamic = "force-dynamic"`
- `src/app/page.tsx` — remove `export const dynamic = "force-dynamic"`
- `src/app/(app)/me/page.tsx` — wrap `new Date()` / time-dependent logic in `<Suspense>`
- `src/lib/utils.ts` — if `getGreeting()` is called at render time, make it cacheable or move the call into a Suspense boundary
- Any `page.tsx` or `layout.tsx` that the build flags as blocking — add `export const instant = false` as a temporary opt-out (with `// TODO: Cache Components adoption` comment)

**Out of scope** (do NOT touch):
- `src/app/(app)/ranking/actions.ts`, `src/app/(app)/match/actions.ts`, `src/app/(app)/turnos/actions.ts` — the `revalidateTag` calls are already correct.
- `src/lib/cached-queries.ts` — Plan 005's cache wrappers are already correct.
- `src/components/navigation/bottom-nav.tsx` — client component, not affected.
- `prisma/schema.prisma` — no schema changes needed.
- Public routes (`/t/[id]`, `/m/[matchId]`, `/p/[userId]`, `/j/[playerId]`) — can be adopted in a follow-up. Add `export const instant = false` as opt-out if they block the build.

## Git workflow

- Branch: `advisor/006-cache-components-adoption`
- Commit per step. Message style: conventional commits (e.g. `chore(next): upgrade to 16.3`, `feat(config): enable cacheComponents`, `fix(routing): migrate force-dynamic to instant opt-outs`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Upgrade Next.js to 16.3+

Run the Next.js upgrade codemod to handle version-to-version migrations:

```bash
npx @next/codemod@latest upgrade latest
```

This upgrades `next`, `eslint-config-next`, and any related packages, and applies codemods for breaking changes between 16.2 and 16.3.

**Verify**: `npx next --version` → ≥ 16.3.0

**Verify**: `npx tsc --noEmit` → exit 0

**Verify**: `npm run build` → exit 0 (build should still pass with the upgraded version, before enabling cacheComponents)

### Step 2: Remove incompatible segment configs

Before enabling `cacheComponents`, remove all `export const dynamic`, `export const revalidate`, and `export const fetchCache` exports — `cacheComponents: true` errors on any file that still exports them.

**`src/app/(app)/match/page.tsx`** — remove line 10:
```tsx
export const dynamic = "force-dynamic";
```
Plan 005's `getCachedConfirmedMatches` replaces the dynamic behavior. If the page still needs to block after enabling cacheComponents, add `export const instant = false` with a TODO comment.

**`src/app/page.tsx`** — remove line 7:
```tsx
export const dynamic = "force-dynamic";
```
If this page (likely the landing/login page) needs to stay dynamic, add `export const instant = false`.

**Verify**: `grep -rn "export const dynamic\|export const revalidate\|export const fetchCache" src/app --include="*.tsx"` → no matches

### Step 3: Fix sync-IO calls in server-rendered routes

Cache Components requires all routes to be prerenderable. `new Date()` and `Date.now()` at module/render time fail the build even with `instant = false`.

**`src/app/(app)/me/page.tsx:25`** — `const now = new Date()` is used for:
- Filtering upcoming vs past matches
- Computing the hero activity (events < 24h away)
- The greeting (`getGreeting()` uses `new Date().getHours()`)

**Fix approach**: Extract the time-dependent logic into a `<Suspense>`-wrapped child component. The static parts (greeting text, stats grid structure) stay in the shell; the time-filtered content streams in.

Create a new component `src/app/(app)/me/dashboard-content.tsx` (async server component) that receives `viewerId` and does the time-dependent queries. Wrap it in `<Suspense fallback={<DashboardSkeleton />}>` in the page (reuse the skeleton from Plan 001's `loading.tsx`).

**`src/lib/utils.ts`** — `getGreeting()` at line 28 uses `new Date().getHours()`. If it's called at render time in a server component, it blocks. Options:
1. Move the greeting into the Suspense-wrapped child (it streams in with the rest).
2. Make it a client component (small, just needs the current hour — but this adds client JS).
3. Cache it with `"use cache"` and a short `cacheLife` (the greeting changes at most once per hour).

Recommended: option 1 (move into the streaming child) — keeps the shell static and the greeting streams in with the content.

**`src/lib/match-queries.ts`** — `getPendingActions` (line 63) and `getPendingActionsCount` (line 78) use `new Date()`. These are called from:
- `src/app/(app)/layout.tsx` — Plan 002 already wraps the notifications badge in `<Suspense>`. The `getPendingActionsCount` call is inside the async `NotificationsCount` component, which is inside `<Suspense fallback={null}>`. This is safe — the sync-IO is inside a Suspense boundary.
- `src/app/(app)/me/page.tsx` — `getPendingActions(viewerId, allPendingMatches)` at line 70. After the Step 3 fix, this call moves into the Suspense-wrapped child. Safe.

**`src/lib/padel-contacts.ts`** — `new Date()` at lines 22 and 125 are inside server action functions (`getPadelContacts`, `getTurnNetworkContacts`). Server actions are NOT prerendered — they run on demand. These are safe and do NOT need changes.

**Verify**: `npm run build` → if it fails with `blocking-prerender` errors naming `new Date()` or `Date.now()`, the fix didn't fully cover all call sites. Check the error's file:line and wrap that call in a Suspense boundary.

### Step 4: Enable Cache Components

Add `cacheComponents: true` to `next.config.ts`:

```ts
const nextConfig = {
  cacheComponents: true,
  turbopack: {},
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
};

export default nextConfig;
```

**Verify**: `npm run build` → expect blocking-route errors. This is expected — the build now validates that every route is prerenderable. Each error names the file and the blocking read. Do NOT panic at the number of errors.

### Step 5: Run the cache-components-instant-false codemod

Run the codemod to opt every page and layout out of validation (Incremental strategy):

```bash
npx @next/codemod@canary cache-components-instant-false ./src/app
```

This inserts `export const instant = false` (with a `// TODO: Cache Components adoption` comment) into every `app/**/{page,layout,default}` file that isn't `"use client"` or `"use server"`.

**Verify**: `grep -rln "TODO: Cache Components adoption" src/app` → should list most page and layout files.

**Verify**: `npm run build` → should now pass (all routes opted out of validation).

### Step 6: Adopt routes one at a time (the loop)

This is the core of the work. For each route, remove its `export const instant = false` opt-out, reload in `next dev`, and fix any blocking errors that surface.

**Recommended order** (by traffic and value):

1. **`/ranking`** — highest value. The ranking list is cached (Plan 005), so the shell + cached data prerenders. Only the viewer's own banner streams in.
2. **`/turnos`** — turns list is cached (Plan 005). Shell + cached turns prerender.
3. **`/match`** — confirmed matches are cached (Plan 005). Pending actions stream in.
4. **`/me`** — most personalized, but the greeting + stats shell can be static after Step 3's Suspense split.
5. **`/notifications`** — simple list, should be quick.
6. **`/me/profile`** — form page, mostly client component already.

For each route:
- Remove `export const instant = false` from the page file.
- Run `npm run dev` and navigate to the route.
- Check the dev overlay for blocking errors.
- If errors: fetch the docs page linked in the error (`https://nextjs.org/docs/messages/<slug>`), apply the recipe.
- If no errors: verify in the browser that the static shell renders first, then content streams in.
- Run `npm run build` to confirm the route passes.

**Verify**: After each route, `npm run build` → exit 0.

**Verify**: After all routes, `grep -rln "TODO: Cache Components adoption" src/app` → should return nothing (all opt-outs removed) or only deliberate blocks with reason comments.

### Step 7: Final build and verification

**Verify**: `npm run build` → exit 0. Check the route table in the build output:
- `○ (Static)` routes are fully prerendered (ideal for public pages).
- `◐ (Partial Prerender)` routes have a static shell + streamed content (the goal for authenticated pages).
- `ƒ (Dynamic)` routes are fully dynamic (only acceptable with a documented reason).

**Manual verification**: Run `npm run dev`, navigate between pages, and confirm:
1. The shell (layout, bottom nav, page header) renders instantly on navigation.
2. Content streams in behind the skeleton fallbacks (from Plan 001).
3. No layout shift (CLS) — the skeletons match the content shape.
4. The notifications badge (from Plan 002) streams in without blocking the shell.

## Test plan

No new unit tests needed — this is a framework configuration change. The verification is the build passing and manual browser confirmation.

If Playwright E2E tests exist, add an `instant()` test for the most critical route (`/ranking`) to prevent regressions:
```ts
import { instant } from '@next/playwright';
// Assert that the ranking page shell is available immediately on navigation
```

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npx next --version` reports ≥ 16.3.0
- [ ] `npx tsc --noEmit` exits 0
- [ ] `npm run build` exits 0
- [ ] `grep "cacheComponents" next.config.ts` returns a match with `true`
- [ ] `grep -rn "export const dynamic\|export const fetchCache" src/app --include="*.tsx"` returns no matches
- [ ] `grep -rln "TODO: Cache Components adoption" src/app` returns no matches (or only deliberate blocks with reason comments)
- [ ] Build output shows `◐ (Partial Prerender)` for at least `/ranking`, `/turnos`, `/match`
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The Next.js upgrade (Step 1) introduces breaking changes that affect the app's runtime behavior (not just build-time validation). Check the [version upgrade guide](https://nextjs.org/docs/app/guides/upgrading) for 16.2 → 16.3.
- The `cache-components-instant-false` codemod is not available (the `@canary` channel may not have it yet). Reproduce by hand: add `export const instant = false` to every `app/**/{page,layout,default}.tsx` that isn't `"use client"` or `"use server"`.
- A route's blocking read is a security gate (auth check, redirect) that cannot be moved into `<Suspense>` without changing what the code guarantees. Read `.agents/skills/next-cache-components-adoption/references/per-page-decisions.md` and ask the user before refactoring.
- The build fails with errors that reference files not listed in "Current state" — the codebase has drifted or there are blocking reads the plan didn't anticipate. Report the full error list.
- `auth()` (from `@/auth`) turns out to require a DB query (not just cookie/JWT decode). This would make every route blocking at the layout level and require a fundamentally different approach (moving auth to middleware/Proxy).

## Maintenance notes

- **Cache Components is a runtime concern, not just build-time.** A passing build doesn't guarantee the route behaves correctly at runtime. Always verify in the browser that the static shell renders first and content streams in.
- **The `instant = false` opt-outs are temporary.** Every `// TODO: Cache Components adoption` comment is a work item. The goal is to remove all of them (or replace with documented reason comments for routes that legitimately must block).
- **`unstable_cache` + `cacheComponents` composition**: Plan 005's `unstable_cache` wrappers with `revalidateTags` compose naturally with Cache Components. The cached data is available at prerender time (cache hit) or streams in (cache miss/invalidation). No changes needed to `cached-queries.ts`.
- **Future optimization**: After adoption, invoke the `next-cache-components-optimizer` skill (`.agents/skills/next-cache-components-optimizer/SKILL.md`) to grow the static shells further and optimize in-app navigation. This is the follow-up that makes navigation truly instant.
- **Next.js version pinning**: After upgrading, pin `next` to an exact version (not a range) to avoid surprise upgrades. The repo currently uses exact versions (`"next": "16.2.6"`), which is correct.
- **`new Date()` discipline**: Going forward, any `new Date()` or `Date.now()` call in a server component must be inside a `<Suspense>` boundary or a `"use cache"` function. Add this to `AGENTS.md` under "Agent Rules" as a project convention.
