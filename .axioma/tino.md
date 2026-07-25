## 📋 BACKLOG

## ✅ DONE
- [x] 2026-07-17 — Setup inicial del agente (sistema .ants creado)
- [x] 2026-07-17 — Resolver incompatibilidad de cron route segment config con cacheComponents (PR #tino/perf/cache-components-fix)
- [x] 2026-07-19 — Completar Plan 006: Upgrade a Next.js 16.3+ y adopción de Cache Components para rutas estáticas y dinámicas (PR #tino/perf/cache-components-adoption)
- [x] 2026-07-20 — Adopción completa de Cache Components para todas las rutas restantes (PR #tino/perf/complete-cache-components-adoption)
- [x] 2026-07-21 — Adopción final y completa de Cache Components para la página pública de turnos /t/[id] (PR #tino/perf/t-id-cache-components-adoption)
- [x] 2026-07-22 — Caching de assets estáticos y CDNs en el Service Worker para mejorar la carga instantánea y soporte offline del PWA (PR #tino/perf/optimize-fcm-sw-caching)
- [x] 2026-07-23 — Optimización de PPR en las tres pestañas principales /ranking, /match y /turnos (PR #tino/perf/complete-ppr-adoption)

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

### 2026-07-20 - Adopción completa y remoción de todos los opt-outs 'instant = false'
**Learning:** Todas las páginas restantes del App Router de Padel Red que tenían la exclusión de Cache Components (`export const instant = false;`) han sido exitosamente adoptadas. Al aislar las consultas y verificaciones de sesión asíncronas (`auth()`, Drizzle database queries, etc.) dentro de componentes secundarios envueltos en `<Suspense>`, logramos que la estructura superior/shell de la página se compile estáticamente y se cargue de forma instantánea desde el CDN.
**Action:** Para garantizar que no haya un desfase o parpadeo visual (Layout Shift / CLS) al resolver el componente dinámico, los esqueletos de carga (`Skeleton` components) deben replicar con total fidelidad la maquetación y jerarquía visual del contenido real, y el contenedor principal o clase estructural de estilo (por ejemplo, `<main className="...">`) debe definirse en el componente síncrono padre en lugar del hijo.

### 2026-07-21 - Adopción de Cache Components en la página pública de turnos /t/[id]
**Learning:** Al remover la última directiva `export const instant = false` del proyecto (en `/t/[id]`), la aplicación de Padel Red ahora está 100% optimizada para PPR. Para lograrlo, delegamos la renderización de la información del turno y la sesión dinámica a un componente asíncrono secundario (`TurnPublicDetails`), manteniéndolo suspendido con un esqueleto (`TurnSkeleton`) como fallback de carga.
**Action:** Mantener la disciplina de diseño PPR. Cualquier nueva ruta o sub-ruta dinámica debe diseñarse de forma asíncrona, aislando el acceso a la sesión, cabeceras, o base de datos dentro de límites de `<Suspense>`.

### 2026-07-22 - Caching de Assets Estáticos en el Service Worker (PWA)
**Learning:** Agregar una estrategia Stale-While-Revalidate en el Service Worker existente (`firebase-messaging-sw.js`) para capturar assets estáticos (`_next/static/`, `/icons/`, `/manifest.webmanifest`, etc.) and CDNs clave de avatares de usuario (`api.dicebear.com`, `lh3.googleusercontent.com`) elimina casi en su totalidad el parpadeo blanco y las demoras de red en las navegaciones subsiguientes o arranques offline. Es crítico saltarse explícitamente peticiones dinámicas como rutas `/api/` y llamadas de datos de Next (`_next/data/`) para no congelar el estado de la aplicación o el proceso de inicio de sesión.
**Action:** Vigilar que nuevas extensiones de recursos o endpoints de APIs externas que devuelvan recursos estáticos sean mapeados en la whitelist del Service Worker.

### 2026-07-23 - Optimización de PPR en las tres pestañas principales /ranking, /match y /turnos
**Learning:** Al aislar el acceso a `auth()` y la resolución de la promesa de `searchParams` en componentes hijos (`RankingContent`, `MatchList`, `TurnsList`), conseguimos que las 3 páginas de pestañas principales de la aplicación se pre-rendericen estáticamente como un "statically pre-rendered shell". Este shell se sirve de forma inmediata, mientras que el contenido real asíncrono se transmite (stream) mediante Next.js Cache Components de forma no bloqueante, eliminando por completo las pantallas en blanco iniciales en la navegación de pestañas.
**Action:** Continuar utilizando este patrón de desacoplamiento de "Páginas Shell síncronas + Contenedores de Datos asíncronas" para mantener la experiencia de usuario instantánea y fluida.
