## 📋 BACKLOG

## ✅ DONE
- [x] 2026-08-04 — Modernización de Confirmaciones de Acciones en Detalle de Partido: Se reemplazaron formularios de servidor síncronos en la página de partido por componentes interactivos de cliente (`CancelMatchForm`, `ConfirmResultForm`, `FinalizeMatchForm` en `src/components/matches/match-actions.tsx`). Se introdujo una confirmación de estado con toggle visual para evitar la eliminación accidental de partidos, cargadores de transición con `useTransition`, notificaciones de Toast y escala táctil conforme al MDS (PR #agus/match/modern-confirmations).
- [x] 2026-08-02 — Implementación del Filtro de Actividad en el Ranking (RankingFilter) con persistencia offline en modo bypass, optimización de renderizado consecutivo para evitar huecos en la visualización de la clasificación (PR #agus/ranking/activity-filter).
- [x] 2026-08-01 — Visualización Detallada de la Fórmula: Desglose visual interactivo de cómo se calcula el puntaje exacto del jugador (racha actual, bonus de sets ganados, etc.) (PR #agus/ranking/score-breakdown-details).
- [x] 2026-07-31 — Recordatorio de Confirmación Pendiente: Acción interactiva y banner de alerta para confirmar resultados de partidos pendientes de confirmación directamente desde el ranking, actualizando las puntuaciones inmediatamente (PR #agus/ranking/confirmation-reminder).
- [x] 2026-07-27 — Ranking Podium Position Deltas & Terminology Accessibility (PR #agus/ranking/podium-deltas-accessibility).
- [x] 2026-07-17 — Corrección del bug de consistencia de posiciones relativas y deltas en `recalculateRankingAction` (PR #1).
- [x] 2026-07-17 — Creación de la sección interactiva `RankingInfo` con explicación de fórmulas, decay, penalizaciones y tiebreak en la página de ranking (PR #1).
- [x] 2026-07-21 — Optimización de consultas de partidos para evitar el over-fetching de datos de usuario (PR #2).
- [x] 2026-07-22 — Resaltado del usuario actual ("Tú") en el podio del ranking para una identificación inmediata (PR #3).
- [x] 2026-07-23 — Implementación de Selección Automática y Visualización de Lado en Resultados de Partido (PR #4).
- [x] 2026-07-24 — Exposición de acción de finalización forzada para organizador en partidos pendientes de confirmación (PR #5).
- [x] 2026-07-25 — Implementación de reseteo de estadísticas para usuarios afectados con 0 partidos y corrección de asimetría en ordenación de ranking (PR #6).
- [x] 2026-07-26 — Visualización transparente de decay temporal por inactividad en banner de ranking y perfiles públicos (PR #7).
- [x] 2026-07-28 — Verificación y validación de la compilación y de la arquitectura de Partial Prerendering (PPR) de Next.js. El codebase se encuentra en estado verde y completamente optimizado.

## 🧠 LEARNINGS
### 2026-08-04 - Modernización de Confirmaciones de Acciones y Prevención de Errores de Fat-Finger
**Learning:** Las interacciones móviles de eliminación, cancelación o confirmación de eventos críticos (como partidos) requieren salvaguardas robustas. Reemplazar formularios de servidor que redirigen o actúan de inmediato al pulsar un botón por componentes con estado interactivo y confirmaciones inline (`useState`) elimina de raíz la fricción y el riesgo de que el organizador elimine un partido accidentalmente. Asimismo, el uso de transiciones nativas de React 19 (`useTransition`) para deshabilitar botones y mostrar estados de carga inline (`Loader2`) ofrece una respuesta visual fluida sin Cumulative Layout Shift (CLS) ni bloqueos de pantalla.
**Action:** Evite siempre el uso de popups de navegador nativos (`confirm()`) o formularios directos sin doble confirmación para acciones destructivas. Implemente el patrón de confirmaciones horizontales compactas (`X` para cancelar y `Confirmar` destacado) bajo la paleta e indicaciones táctiles de MDS en todo el flujo de partidos.

### 2026-08-02 - Filtro de Actividad en Clasificación y Mock Bypass de Consultas
**Learning:** Al introducir elementos interactivos que dependan de consultas pesadas de bases de datos de cara al público (como el listado del ranking), es fundamental asegurar que estas consultas cuenten con la infraestructura adecuada para soportar el modo de bypass de credenciales de base de datos (`AUTH_BYPASS === "true"`) que usan las pruebas visuales de Playwright. Suministrar una derivación de mock completa de `getCachedRanking` y búsquedas correspondientes permite que las CUJs se validen sin necesidad de un motor PostgreSQL activo. Asimismo, remapear posiciones de forma consecutiva cuando el filtro de inactividad oculta jugadores previene saltos numéricos visualmente incómodos para el usuario.
**Action:** En cualquier modulo con consultas de clasificación o listados públicos, implemente siempre un fallback elegante para el entorno de bypass, de modo que las pruebas de integration visuales puedan ejecutarse de forma rápida y confiable offline.

### 2026-08-01 - Desglose Detallado del Puntaje de Clasificación (Interactividad y Transparencia)
**Learning:** El ranking es un factor clave en la retención del usuario, pero cuando las reglas y fórmulas de juego no son transparentes, los jugadores pierden motivación. Al incorporar un desglose interactivo ("Ver desglose de puntos") mediante un Server Action perezoso y un componente colapsable con estado de transición (`useTransition`), dotamos al usuario de total transparencia matemática de inmediato sin sobrecargar el primer renderizado de la página, ni incurrir en Cumulative Layout Shift (CLS), manteniendo el pre-renderizado parcial (PPR) de Next.js al 100% optimizado.
**Action:** Utilizar siempre carga bajo demanda (on-demand lazy fetching) para bloques de datos secundarios complejos y detallados, combinando Server Actions con transiciones de React 19 para mantener la interfaz ultra-reactiva y libre de CLS.
