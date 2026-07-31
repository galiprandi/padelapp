## 📋 BACKLOG

## ✅ DONE
- [x] 2026-07-30 — Almacenamiento en caché de la cantidad de acciones pendientes y optimización del feedback táctil del Bottom Navigation (PR #tino/perf/notifications-badge-performance-and-ux)
- [x] 2026-07-28 — Refactorización de try/catch en auth() para reenviar señales de control de flujo/bailout de Next.js PPR (PR #tino/perf/rethrow-nextjs-bailout-signals)
- [x] 2026-07-27 — Refactorización y optimización de formularios dinámicos a Server Components para PPR (PR #tino/perf/optimize-routing-performance)
- [x] 2026-07-26 — Estandarización de accesibilidad por teclado y feedback táctil en todos los botones y enlaces de retroceso (PR #tino/ux/back-button-accessibility)
- [x] 2026-07-25 — Implementación de esqueleto de alta fidelidad para la pestaña de red /network (PR #tino/perf/optimize-routing-performance)
- [x] 2026-07-23 — Optimización de PPR en las tres pestañas principales /ranking, /match y /turnos (PR #tino/perf/complete-ppr-adoption)
- [x] 2026-07-22 — Caching de assets estáticos y CDNs en el Service Worker para mejorar la carga instantánea y soporte offline del PWA (PR #tino/perf/optimize-fcm-sw-caching)
- [x] 2026-07-21 — Adopción final y completa de Cache Components para la página pública de turnos /t/[id] (PR #tino/perf/t-id-cache-components-adoption)
- [x] 2026-07-20 — Adopción completa de Cache Components para todas las rutas restantes (PR #tino/perf/complete-cache-components-adoption)
- [x] 2026-07-19 — Completar Plan 006: Upgrade a Next.js 16.3+ y adopción de Cache Components para rutas estáticas y dinámicas (PR #tino/perf/cache-components-adoption)
- [x] 2026-07-17 — Resolver incompatibilidad de cron route segment config con cacheComponents (PR #tino/perf/cache-components-fix)
- [x] 2026-07-17 — Setup inicial del agente (sistema .ants creado)

## 🧠 LEARNINGS
### 2026-07-30 - Almacenamiento en caché de contadores globales de notificaciones
**Learning:** En una SPA/PWA móvil, hay componentes globales (como el badge de notificaciones flotante) que se renderizan y evalúan en casi todas las transiciones de página. Si estos componentes realizan consultas directas de agregación (como `count()`) sobre tablas de base de datos en cada transición, se genera un cuello de botella de rendimiento y un consumo innecesario de conexiones SQL. Al envolver estas consultas dinámicas con la función `unstable_cache` de Next.js usando un TTL corto (como 30 segundos) y asociándolas con tags de invalidación correspondientes (como `"matches"`), eliminamos por completo el waterfall de consultas a base de datos en transiciones de layout, garantizando una carga instantánea con datos siempre frescos.
**Action:** Cachar siempre los contadores agregados de componentes globales y layouts recurrentes con un TTL ágil para optimizar la latencia en navegación.

### 2026-07-30 - Sincronización del feedback táctil móvil con estándares MDS
**Learning:** El Minimal Design System (MDS) establece el uso del factor de escala activa `active:scale-[0.98]` como respuesta háptica estándar para micro-interacciones táctiles en dispositivos móviles. Valores de escala más pronunciados (como `active:scale-[0.95]`) producen un salto visual tosco y asimétrico en elementos críticos como el Bottom Navigation bar. Sincronizar todos los enlaces táctiles globales al estándar de micro-interacciones del MDS unifica la sensación premium y fluida de la aplicación.
**Action:** Utilizar consistentemente `active:scale-[0.98]` para todas las micro-interacciones de escala activa en botones y enlaces.

### 2026-07-28 - Reenvío de Señales de Control de Flujo de Next.js PPR en `auth()`
**Learning:** Durante la compilación con PPR habilitado, Next.js aborta de manera intencionada y controlada el flujo de ejecución cuando se llaman APIs dinámicas (como `headers()` o `cookies()`) en fase de prerenderizado para registrar los límites dinámicos. Si estos errores (identificados por digests como `NEXT_DYNAMIC_NO_SSR_CODE` o `HANGING_PROMISE_REJECTION`) son capturados e interceptados por un bloque `try/catch` genérico (como el que envuelve a la sesión en `auth()`), el motor de Next.js no puede registrar correctamente los límites dinámicos. Esto provoca advertencias ruidosas en el build y puede causar desoptimizaciones. Al detectar y relanzar (rethrow) explícitamente estas excepciones de prerenderizado, logramos que la compilación sea 100% limpia y precisa.
**Action:** Evitar siempre capturar silenciosamente errores de flujo de Next.js (como bailouts o redirecciones) en funciones transversales de autenticación o layouts.

### 2026-07-27 - Refactorización de Formularios Dinámicos para PPR y Cascarón Estático
**Learning:** Las páginas de edición o carga de datos dinámicos (`/edit`, `/result`) suelen implementarse erróneamente como componentes puramente de cliente (`"use client"`) monolíticos con carga en `useEffect`, perdiendo todos los beneficios de la compilación estática parcial. Al dividirlas en un contenedor Server Component padre y un formulario secundario Client Component hijo, podemos renderizar la estructura y las cabeceras del cascarón de forma 100% estática para servirla instantáneamente desde el CDN, delegando las llamadas asíncronas de base de datos a un `<Suspense>` boundary con esqueletos estructurados exactamente con el diseño final.
**Action:** Continuar reemplazando componentes monolíticos `"use client"` con este patrón asíncrono para mantener transiciones instantáneas y evitar CLS o pantallas en blanco molestas.

### 2026-07-26 - Accesibilidad de teclado y feedback táctil en botones de retroceso (MDS)
**Learning:** Los botones y enlaces de retroceso (`ChevronLeft` / `Volver`) distribuidos en vistas clave carecían de estilos de foco por teclado, impidiendo que usuarios de navegación accesible identifiquen visualmente el foco. Standardizar el uso de transiciones globales suaves (`transition-all`), el anillo de foco del MDS (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background`) y feedback táctil de escala activa (`active:scale-[0.98]`) mejora drásticamente la calidad y consistencia del diseño.
**Action:** Asegurar que cualquier enlace o botón personalizado de retroceso implementado a futuro cumpla rigurosamente con esta especificación visual del MDS.

### 2026-07-25 - Esqueleto de alta fidelidad para la página de Red
**Learning:** En páginas de métricas o paneles densos como `/network`, el uso de un cargador spinner genérico perjudica la experiencia de navegación del usuario al parpadear la interfaz completa. Diseñar un esqueleto de alta fidelidad (`NetworkSkeleton`) que pre-estructure de forma exacta la cuadrícula, los encabezados y las listas de datos elimina por completo el Layout Shift (CLS) visual y da una sensación de carga instantánea del lado del cliente mientras el PPR resuelve el componente del servidor.
**Action:** Replicar siempre la maquetación exacta en los fallbacks de `<Suspense>` para mantener estabilidad estructural en la carga.
