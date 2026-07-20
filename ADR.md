---
status: accepted
date: 2026-07-20
decision-makers: cenco
---

# Pin pnpm 10 and prune optional peer deps (Prisma/effect)

## Context and Problem Statement

Dependabot raised a **HIGH** alert (`CVE-2026-32887`) on `effect@3.16.12` for AsyncLocalStorage context contamination under concurrent RPC load. Investigation showed `effect` is **not a direct dependency** — it enters transitively via `@prisma/config`, pulled in by `@prisma/client` and `prisma`, which `drizzle-orm` declares as **optional peer dependencies**. The project migrated from Prisma to Drizzle and has zero Prisma usage in source (no imports, no `prisma/` directory, no `schema.prisma`), yet pnpm's default `auto-install-peers=true` was auto-installing ~17 unused DB drivers (Prisma, `mysql2`, `sqlite3`, `knex`, `kysely`, `better-sqlite3`, `expo-sqlite`, etc.).

Separately, the local environment was running **pnpm 11.13.1**, which is **not supported by Vercel** (Vercel officially supports pnpm 6–10). pnpm 11 also:
- Removed `onlyBuiltDependencies` in favor of `allowBuilds` (unknown to Vercel's pnpm).
- Requires Node.js 22+ and is pure ESM.
- Breaks Vercel's auto-detection: `ERR_PNPM_UNSUPPORTED_ENGINE` / `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`.

This had caused Vercel build failures before. The combination of an unsupported package manager + a transitive HIGH-severity vulnerability from a library we don't use forced a decision.

## Decision

1. **Pin pnpm 10.34.5** via `"packageManager": "pnpm@10.34.5"` in `package.json`. Vercel resolves this via Corepack and uses the exact version — no guessing from lockfile version or project creation date.
2. **Set `auto-install-peers=false`** in `.npmrc` to stop pnpm from auto-installing optional peer deps. Only the DB drivers we actually use (`pg`, `@neondatabase/serverless`) remain, because they are declared as direct dependencies.
3. **Migrate `pnpm-workspace.yaml` from `allowBuilds` (pnpm 11 format) to `onlyBuiltDependencies` (pnpm 10 format)** and remove Prisma entries. Approve build scripts for `esbuild`, `sharp`, `unrs-resolver`, `@firebase/util`.
4. **Regenerate `pnpm-lock.yaml` with pnpm 10** to ensure Vercel-compatible lockfile format.

### Non-goals

- Upgrading to pnpm 11 or 12 — blocked on Vercel support.
- Migrating to `bun` or `npm` — no compelling reason; pnpm's disk efficiency matters.
- Addressing the remaining Dependabot alerts (`esbuild`, `uuid`, `@babel/core`, `js-yaml`) — they are dev-only or low-severity transitive and resolve with upstream updates.

## Consequences

- Good, because the HIGH-severity `effect` alert is eliminated at the root (no longer in the dependency tree).
- Good, because `node_modules` shrinks by ~17 unused DB driver packages — smaller install surface, faster CI, smaller attack surface.
- Good, because Vercel builds will use the exact pinned pnpm version — no more auto-detection surprises.
- Good, because `pnpm install` and `pnpm build` run clean locally without `ERR_PNPM_IGNORED_BUILDS`.
- Bad, because `auto-install-peers=false` is a global setting — if a future direct dependency relies on an optional peer being auto-installed, it will need to be added explicitly. This is considered acceptable: explicit > implicit.
- Bad, because pnpm 10 will eventually be EOL'd; this decision will need revisiting when Vercel adds pnpm 11/12 support.

## Implementation Plan

- **Affected paths**:
  - `.npmrc` (new) — `auto-install-peers=false`
  - `package.json` — add `"packageManager": "pnpm@10.34.5"`
  - `pnpm-workspace.yaml` — `onlyBuiltDependencies` list (pnpm 10 format)
  - `pnpm-lock.yaml` — regenerated with pnpm 10
- **Dependencies**: removed from tree — `prisma`, `@prisma/client`, `@prisma/config`, `@prisma/engines`, `@prisma/debug`, `effect`, plus 17 unused DB drivers (`mysql2`, `sqlite3`, `knex`, `kysely`, `better-sqlite3`, `expo-sqlite`, `@libsql/client`, `@xata.io/client`, `@electric-sql/pglite`, `@planetscale/database`, `@tidbcloud/serverless`, `@aws-sdk/client-rds-data`, `@cloudflare/workers-types`, `@op-engineering/op-sqlite`, `gel`, `sql.js`, `postgres`).
- **Patterns to follow**: declare DB drivers as direct dependencies when used (we already do: `pg`, `@neondatabase/serverless`).
- **Patterns to avoid**: do NOT add `@prisma/client` or `prisma` back as dependencies — the project uses Drizzle exclusively. Do NOT upgrade pnpm beyond 10.x until Vercel announces support.

### Verification

- [x] `pnpm why effect` returns empty
- [x] `pnpm why prisma` returns empty
- [x] `pnpm why @prisma/client` returns empty
- [x] `pnpm install` completes without `ERR_PNPM_IGNORED_BUILDS`
- [x] `pnpm build` exits 0 with all 28 routes generated
- [x] `pnpm-lock.yaml` header reads `lockfileVersion: '9.0'` (Vercel-compatible)
- [x] `package.json` contains `"packageManager": "pnpm@10.34.5"`
- [x] After commit + push: Vercel production build succeeds on `padelred.app` (deploy `dpl_FrpzrzPwVYJCr8KFLPzyBC7gDSed`, build 58s, used `pnpm v10.34.5` via `packageManager` field, zero `prisma`/`effect`/`ERR_PNPM` mentions in logs)
- [ ] After commit + push: Dependabot alert #2 (`effect`) auto-closes (GitHub re-scans within ~24h)

## Alternatives Considered

- **Stay on pnpm 11 + enable `ENABLE_EXPERIMENTAL_COREPACK=1` on Vercel**: rejected — depends on an experimental Vercel flag, pnpm 11 is not officially supported, and `allowBuilds` format is unrecognized by Vercel's pnpm runtime.
- **Stay on pnpm 11 + generate lockfile with pnpm 10 via Docker/corepack**: rejected — adds CI complexity, lockfile drift risk, and doesn't solve the `allowBuilds` format incompatibility.
- **Keep `auto-install-peers=true` + use `pnpm.overrides` to exclude Prisma**: rejected — pnpm has no native "exclude peer" mechanism; overrides would require hacky version pinning and wouldn't scale to the other 16 unused drivers.
- **Dismiss the Dependabot alert as `tolerable_risk` without cleaning the tree**: rejected — leaves ~17 unused packages in `node_modules` and doesn't address the pnpm 11 / Vercel incompatibility that caused prior build failures.

## More Information

- Dependabot alert #2: `GHSA-38f7-945m-qr2g` / `CVE-2026-32887` (effect HIGH).
- Vercel package manager support table: https://vercel.com/docs/package-managers (pnpm 6–10).
- pnpm 11 release notes: https://github.com/pnpm/pnpm/releases/tag/v11.0.0 (Node 22+, `allowBuilds` replaces `onlyBuiltDependencies`).
- Related AGENTS.md section: "Auth — Pitfalls & Learnings" documents prior Vercel/build fragility.
- **Revisit when**: Vercel announces official pnpm 11 or 12 support, OR `drizzle-orm` drops `@prisma/client` from its optional peer deps.
