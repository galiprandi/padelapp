# Especificación de Ranking

- Path: `/ranking`
- Estado: Implemented
- Público: solo usuarios autenticados (mismo guard que layout `(app)`)
- Rol: **gancho de engagement competitivo** — no es un sistema técnico de medición de nivel. El nivel auto-reportado (1–8) sigue siendo la referencia práctica para armar partidos.

## Objetivo
- Proveer un ranking simple que motive a los jugadores a registrar resultados y volver a la app.
- Generar conversación y rivalidad sana dentro del grupo de juego.
- Permitir al usuario ver su posición actual, puntos y variación.
- Prioridad mobile-first, CTA y affordances claros.

## Alcance (MVP)
- Ranking **individual** por jugador (no contempla parejas todavía).
- Tabla global de ranking (sin filtros por club/zona aún).
- Cada fila: posición, nombre preferido (alias > displayName), nivel, puntos, delta reciente (+/-).
- Sticky highlight para el usuario logueado si está fuera del viewport.
- Fuentes de datos: resultados confirmados de partidos (`status = CONFIRMED`) y asistencia (no-shows).
- Recalculo manual (server action) o automático tras guardar resultado; cron es “nice to have”.
- Sin perfiles públicos aún; link del usuario propio va a `/me`.

## Modelo de datos (implementado)
- Ranking data cached in `User` model: `rankingScore`, `rankingPosition`, `rankingDelta`, `matchesPlayed`, `wins`, `losses`, `attendanceScore`, `lastMatchAt`.
- No historical snapshot tables (`RankingSnapshot` / `RankingEntry`) — these were proposed but not implemented. The current approach is sufficient for the ranking's role as a competitive hook.
- Future: consider snapshot tables only if historical analysis becomes a real need.

## Fórmula (implementada)
- Base: `score = 1000 + (wins * 15) + (losses * 0) + (streak * 5)`.
- Bonus por sets ganados en victoria: +2 por set ganado; en derrota +1 por set ganado.
- Penalización por no-show registrado: -25 por evento y reduce `attendanceScore`.
- Atenuación temporal: resultados >60 días aplican un factor 0.5; >120 días factor 0.25.
- `attendanceScore` = (partidos asistidos / partidos confirmados) limitado a [0,1]; se muestra como porcentaje.
- Orden de desempate:
  1) `score` (desc)
  2) `attendanceScore` (desc)
  3) `wins` (desc)
  4) `lastMatchAt` (más reciente primero)

## Backend / Server Actions (implementado)
- `recalculateRankingAction` in `src/app/(app)/ranking/actions.ts` — recalculates scores, applies attendance penalties (no-show / late), updates `User` cache fields, revalidates `/ranking` and `/me`.
- Ranking query in `src/app/(app)/ranking/page.tsx` — returns ordered list with position, name (alias preferred), level, score, delta, attendance, wins, losses.
- User's own position shown via `UserRankingBanner` component.

## UI / UX
- **Vista Ranking** (`/ranking`):
  1) Header: título “Ranking” + descripción corta “Posiciones actualizadas según resultados confirmados”.
  2) Banner del usuario actual (card compacta) mostrando posición, puntos y delta; si no está en ranking, mostrar “Aún sin posición, jugá tu primer partido”.
  3) Tabla / lista:
     - Cada fila: `#pos`, avatar, nombre (alias preferido), nivel (badge), puntos grandes, delta (+/- con color), attendance (%), wins-loss.
     - Filas táctiles, altura mínima 64px, con estados hover/focus/active.
  4) CTA secundarios:
     - Botón “Ver mis partidos” → `/match`
     - Botón “Crear partido” → `/match/new`
  5) Empty state: “Sin partidas confirmadas aún. Registrá resultados para entrar al ranking.”
- **Vista Reputación** (sección separada o `tabs` dentro de `/ranking`):
  1) Header corto: “Reputación” + copy: “Basada en asistencia y no-shows, no afecta tu ranking deportivo.”
  2) Card del usuario actual: reputación (0–100), asistencias vs confirmaciones, no-shows y última incidencia.
  3) Lista opcional: top usuarios por reputación (si se habilita) con avatar, alias, repScore%, matchesConfirmed, no-shows.
  4) CTA secundario: “Ver mis partidos” → `/match` para mejorar asistencia.
  5) Empty state: “Sin datos de asistencia aún.”
- Mobile-first: usar layout en tarjetas apiladas o tabla responsiva con tipografía clara; en desktop se puede mostrar tabla densa.
- Colores: mantener tema amarillo (primario) y uso de `text-muted-foreground` para subtítulos.
- Accesibilidad: `aria-sort` en headers si se habilita orden; roles `row`/`cell`; texto alternativo en avatares (iniciales).

## Validaciones y estados (implementado)
- Loading: skeleton de header + 5 filas.
- Error: mensaje inline con retry.
- Sin datos: empty state descrito arriba.
- Inyección de preferencia de nombre: usar helper `getUserDisplayName(user)` (alias > displayName).

## Integraciones transversales
- `/me`: mostrar card “Tu ranking” con posición/puntos actuales y enlace a `/ranking`.
- `MatchResultCompact` y demás tarjetas ya deberían honrar alias; mantener consistencia.
- Revalidar `/ranking` y `/me` al confirmar resultados o actualizar alias (para reflejar display).

## Métricas y trazabilidad
- Loguear recalculos con duración y cantidad de usuarios procesados.
- Guardar timestamp de último recalculo para mostrar “Actualizado hace X min”.
- (Futuro) telemetry/analytics de clics en filas y CTAs.

## Roadmap posterior (no prioritario — el ranking es un gancho, no el valor central)
- Filtros por club/zona.
- Temporadas / ladders independientes.
- Perfiles públicos de jugador desde fila del ranking.
- Ajustar fórmula con ELO simplificado (K-factor) cuando haya suficientes datos.
- Cron programado (Vercel cron) diario.
- Mínimo de partidos para aparecer en ranking público (evitar ruido con pocos datos).
