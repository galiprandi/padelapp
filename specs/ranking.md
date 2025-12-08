# Especificación de Ranking (MVP)

- Path: `/ranking`
- Estado: Not Implemented (este documento define el MVP y próximas iteraciones)
- Público: solo usuarios autenticados (mismo guard que layout `(app)`)

## Objetivo
- Mostrar la tabla de posiciones de jugadores de pádel considerando desempeño reciente y confiabilidad (asistencia).
- Permitir al usuario ver su posición actual, puntos y variación.
- Prioridad mobile-first, CTA y affordances claros.

## Alcance (MVP)
- Tabla global de ranking (sin filtros por club/zona aún).
- Cada fila: posición, nombre preferido (alias > displayName), nivel, puntos, delta reciente (+/-).
- Sticky highlight para el usuario logueado si está fuera del viewport.
- Fuentes de datos: resultados confirmados de partidos (`status = CONFIRMED`) y asistencia (no-shows).
- Recalculo manual (server action) o automático tras guardar resultado; cron es “nice to have”.
- Sin perfiles públicos aún; link del usuario propio va a `/me`.

## Modelo de datos propuesto
- Tabla `User` ya tiene `alias`, `displayName`, `level`.
- Nueva tabla `RankingSnapshot` (para históricos y auditoría):
  - `id`, `createdAt`, `season` (string, ej. `"global-2025-q1"`), `computedAt`.
  - `entries`: modelado como tabla `RankingEntry`:
    - `id`
    - `userId` (FK User)
    - `score` (float) — valor final para ordenar.
    - `wins` (int), `losses` (int), `matchesPlayed` (int)
    - `attendanceScore` (float 0–1) — penaliza no-shows.
    - `streak` (int, positivos = victorias consecutivas, negativos = derrotas).
    - `lastMatchAt` (DateTime)
    - `position` (int)
    - `positionChange` (int) — comparación contra snapshot previo (misma season).
- Para MVP se puede persistir solo en `User` (`rankingScore`, `rankingPosition`, `rankingDelta`, `matchesPlayed`, `wins`, `losses`, `attendanceScore`, `lastMatchAt`) y luego migrar a snapshots.

## Fórmula MVP (sujeta a ajuste)
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

## Backend / Server Actions
- `recalculateRankingAction({ season?: string })`
  - Requiere sesión admin (por ahora permitir cualquier usuario hasta tener roles).
  - Lee partidos `status=CONFIRMED`, agrupa por jugador.
  - Calcula métricas y score; guarda en `RankingEntry` y opcionalmente en `User` (campo cache).
  - Revalida `/ranking` y `/me`.
- `getRankingAction({ limit?: number, season?: string })`
  - Devuelve array ordenado con: userId, displayNamePreferido, score, position, positionChange, level, attendanceScore, wins, losses, matchesPlayed, lastMatchAt.
  - Incluye posición del usuario actual aunque esté fuera del top N (append “tu posición”).

## UI / UX `/ranking`
- Estructura:
  1) Header: título “Ranking” + descripción corta “Posiciones actualizadas según resultados confirmados”.
  2) Banner del usuario actual (card compacta) mostrando posición, puntos y delta; si no está en ranking, mostrar “Aún sin posición, jugá tu primer partido”.
  3) Tabla / lista:
     - Cada fila: `#pos`, avatar, nombre (alias preferido), nivel (badge), puntos grandes, delta (+/- con color), attendance (%), wins-loss.
     - Filas táctiles, altura mínima 64px, con estados hover/focus/active.
  4) CTA secundarios:
     - Botón “Ver mis partidos” → `/match`
     - Botón “Crear partido” → `/match/new`
  5) Empty state: “Sin partidas confirmadas aún. Registrá resultados para entrar al ranking.”
- Mobile-first: usar layout en tarjetas apiladas o tabla responsiva con tipografía clara; en desktop se puede mostrar tabla densa.
- Colores: mantener tema amarillo (primario) y uso de `text-muted-foreground` para subtítulos.
- Accesibilidad: `aria-sort` en headers si se habilita orden; roles `row`/`cell`; texto alternativo en avatares (iniciales).

## Validaciones y estados
- Loading: skeleton de header + 5 filas.
- Error: mensaje inline con retry (reinvocar `getRankingAction`).
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

## Roadmap posterior
- Filtros por club/zona.
- Temporadas / ladders independientes.
- Perfiles públicos de jugador desde fila del ranking.
- Ajustar fórmula con ELO simplificado (K-factor) cuando haya suficientes datos.
- Cron programado (Vercel cron) diario.
