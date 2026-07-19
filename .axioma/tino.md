## 📋 BACKLOG

## ✅ DONE
- [x] 2026-07-17 — Setup inicial del agente (sistema .ants creado)
- [x] 2026-07-17 — Resolver incompatibilidad de cron route segment config con cacheComponents (PR #tino/perf/cache-components-fix)
- [x] 2026-07-19 — Completar Plan 006: Upgrade a Next.js 16.3+ y adopción de Cache Components para rutas estáticas y dinámicas (PR #tino/perf/cache-components-adoption)

## 🧠 LEARNINGS
### 2026-07-17 - Setup inicial
**Learning:** El sistema .ants fue creado con 4 agentes especializados para Padel Red. Cada agente tiene scope boundaries estrictas para evitar conflictos.
**Action:** Respetar las boundaries en cada run. Si una mejora requiere tocar otro scope, registrar en backlog y notificar en el PR.

### 2026-07-17 - Compatibilidad de Route Segment Config con Cache Components
**Learning:** Next.js con la bandera experimental `cacheComponents: true` (PPR habilitado) genera errores de compilación si encuentra API Routes o páginas que declaran explícitamente `export const dynamic = "force-dynamic"`.
**Action:** Eliminar `export const dynamic = "force-dynamic"`. Si la ruta necesita ser dinámica, Next.js la tratará automáticamente como tal al leer cabeceras (headers), cookies o parámetros dinámicos de búsqueda en tiempo de ejecución, sin necesidad de forzarlo estáticamente.

### 2026-07-19 - Adopción de Cache Components en la página de Notificaciones
**Learning:** Para habilitar la renderización parcial y streaming en páginas que dependen de cookies o sesiones dinámicas (como `/notifications` que usa `auth()`), se debe separar el contenido dinámico en un componente asíncrono secundario envuelto en `<Suspense>` con un esqueleto (skeleton) adecuado. De esta manera, el shell estático de la página se pre-renderiza instantáneamente en tiempo de compilación y se sirve de inmediato desde el CDN, mientras que la lista de acciones dinámicas se transmite (stream) conforme se resuelve la sesión.
**Action:** Continuar utilizando este patrón para otras rutas dinámicas dentro del scope del agente, removiendo los opt-outs `export const instant = false` de forma progresiva.
