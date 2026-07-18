## 📋 BACKLOG
- [ ] Upgrade to Next.js 16.3+ and adopt Cache Components (Plan 006)

## ✅ DONE
- [x] 2026-07-17 — Setup inicial del agente (sistema .ants creado)
- [x] 2026-07-17 — Resolver incompatibilidad de cron route segment config con cacheComponents (PR #tino/perf/cache-components-fix)

## 🧠 LEARNINGS
### 2026-07-17 - Setup inicial
**Learning:** El sistema .ants fue creado con 4 agentes especializados para Padel Red. Cada agente tiene scope boundaries estrictas para evitar conflictos.
**Action:** Respetar las boundaries en cada run. Si una mejora requiere tocar otro scope, registrar en backlog y notificar en el PR.

### 2026-07-17 - Compatibilidad de Route Segment Config con Cache Components
**Learning:** Next.js con la bandera experimental `cacheComponents: true` (PPR habilitado) genera errores de compilación si encuentra API Routes o páginas que declaran explícitamente `export const dynamic = "force-dynamic"`.
**Action:** Eliminar `export const dynamic = "force-dynamic"`. Si la ruta necesita ser dinámica, Next.js la tratará automáticamente como tal al leer cabeceras (headers), cookies o parámetros dinámicos de búsqueda en tiempo de ejecución, sin necesidad de forzarlo estáticamente.
