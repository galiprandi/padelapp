## 📋 BACKLOG

## ✅ DONE
- [x] 2026-08-11 — Turn Chat with Ephemeral Upstash Redis Storage and System Bot (bela/turnos/turn-chat-implementation)
- [x] 2026-08-09 — Argentine Spanish Voice & Language Standardization (bela/turnos/voice-language-standardization)
- [x] 2026-08-08 — Contextual Quick-Join, Branded Active Toast Copy & MDS Styling Refinement (bela/turnos/quick-join-and-copy-polish)
- [x] 2026-08-06 — Future-Date Turn Validation & Branded Toast Alignment (bela/turnos/future-date-validation-and-branded-toasts)
- [x] 2026-08-05 — Modernized Turn Action Confirmations (bela/turnos/modern-confirmations)
- [x] 2026-08-03 — Interactive WhatsApp Invite Recommendations (bela/turnos/whatsapp-invite-suggestions)
- [x] 2026-08-01 — Turn Social Proof & Contact Highlights (bela/turnos/social-proof-contacts)
- [x] 2026-07-17 — Setup inicial del agente (sistema .ants creado)
- [x] 2026-07-17 — Enforce Cooldown en acción de salvage manual `openToNetworkAction` para evitar spam de notificaciones.
- [x] 2026-07-17 — Refactorizar página de edición de turnos `/turnos/[id]/editar` a HTML semántico y escala Tailwind estándar (MDS).
- [x] 2026-07-18 — Sistema de "Recomendación proactiva de niveles" al crear y editar un turno para advertir al organizador sobre incompatibilidades de nivel.
- [x] 2026-07-18 — Corrección de error de compilación de Turbopack en `substitute-reminder` cron por incompatibilidad de `export const dynamic = "force-dynamic"` con `cacheComponents`.
- [x] 2026-07-19 — Implementación de Indicadores de Contactos en la Vista de Turnos y Corrección de la Recomendación de Niveles en Creación (PR #124)
- [x] 2026-07-20 — Adopción de Cache Components / PPR en la página pública de detalle de turno `/t/[id]` y esqueleto de carga de alta fidelidad (PR #125)
- [x] 2026-07-21 — Adopción completa de Cache Components / PPR en la página pública de detalle de turno /t/[id] mediante unificación de Suspense y remoción de "instant = false" (PR actual)
- [x] 2026-07-22 — Mejoras de Recuperación y Salvage de Turnos (UX de Cooldown interactivo y Conexiones Mutuas en Detalle de Turno)
- [x] 2026-07-23 — Alerta de Baja Tardía (late leave penalty) and habilitación del botón "Iniciar partido" para partidos con 4+ jugadores en turnos no llenos.
- [x] 2026-07-24 — Refactorización estética de Creación de Turnos a Estándares MDS y botón Volver (PR actual)
- [x] 2026-07-25 — Integración del botón de "Agregar al Calendario" para reducir olvidos y cancelaciones de turnos.
- [x] 2026-07-26 — Filtro interactivo de Turnos "Todos" vs "Mis Turnos" bajo estándares MDS (PPR compatible)
- [x] 2026-07-27 — Botones de Acción Interactivos en Detalle de Turno con Estados de Carga (PR actual)
- [x] 2026-07-28 — Estandarización de Filtros Sólidos y Cooldown en Tarjetas de Turno (PR bela/turnos/solid-filters-and-cooldown)
- [x] 2026-07-30 — Barra de Progreso de Turnos y CTA Contextual de Invitación para Cupos Vacíos (PR bela/turnos/progress-and-contextual-invite)
- [x] 2026-07-31 — Spanish Dynamic Turn Notification Relative Date Formatting (bela/turnos/dynamic-relative-dates)

## 🧠 APRENDIZAJES
## 2026-08-11 - Turn Chat with Ephemeral Upstash Redis Storage and System Bot
**Learning:** Designing chat storage using an ephemeral key-value/LIST mechanism in `@upstash/redis` with 90-day auto-expiry provides extremely high scalability without the need for relational database tables. To make this rock-solid for serverless on Vercel where long-lived WebSockets are unstable, using standard HTTP/Rest-based polling (e.g. 5-second interval) is an extremely resilient and performant solution. Furthermore, adding high-fidelity, realistic localized mock data under bypass mode guarantees perfect offline builds and E2E visual Playwright verification. Finally, when integrating scrollable features on views with a sticky fixed bottom bar, introducing a dedicated container margin or bottom height spacer (e.g., `h-64`) is essential to prevent interactive elements from being visually or functionally intercepted.
**Action:** Always employ high-fidelity mock fallbacks in store wrappers to facilitate visual test compilation and execution. Ensure scrollable list elements on mobile viewports include proper spacing/padding to avoid collision or overlap with fixed-positioned action menus.
