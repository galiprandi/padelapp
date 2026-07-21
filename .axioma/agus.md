## 📋 BACKLOG

## ✅ DONE
- [x] 2026-07-17 — Corrección del bug de consistencia de posiciones relativas y deltas en `recalculateRankingAction` (PR #1).
- [x] 2026-07-17 — Creación de la sección interactiva `RankingInfo` con explicación de fórmulas, decay, penalizaciones y tiebreak en la página de ranking (PR #1).
- [x] 2026-07-21 — Optimización de consultas de partidos para evitar el over-fetching de datos de usuario (PR #2).

## 🧠 LEARNINGS
### 2026-07-17 - Consistencia Relativa en Cálculos Incrementales
**Learning:** Al recalcular de forma incremental (`affectedUserIds`), las puntuaciones de los jugadores que no jugaron no cambian, pero su posición relativa en el ranking sí puede cambiar debido al movimiento de otros jugadores. Si se omiten estas actualizaciones, se rompe la secuencia de posiciones y deltas globales.
**Action:** Asegurar que se comparen `oldPosition` y `oldDelta` de todos los usuarios para persistir cualquier desplazamiento colateral.

### 2026-07-17 - Transparencia de Mecánicas de Juego (MDS)
**Learning:** Los sistemas de gamificación como los rankings son mucho más adictivos y motivadores cuando los jugadores entienden las reglas claras (por ejemplo, el decay por inactividad o las penalizaciones por ausencia). Un componente explicativo interactivo y elegante sin fricción visual (MDS Maxim 1.3/1.8) mejora radicalmente el entendimiento.
**Action:** Integrar explicaciones interactivas ligeras (`details` / `useState` toggles) en áreas complejas del producto.

### 2026-07-21 - Optimización de Consultas en Drizzle (Over-fetching)
**Learning:** El uso predeterminado de relaciones completas (como `user: true` o `with: { user: true }`) en Drizzle ORM puede causar un over-fetching masivo, recuperando columnas pesadas o sensibles que no son utilizadas en la interfaz. Al utilizar la opción `columns` de la consulta de relación, es posible restringir los datos al mínimo requerido (`id`, `displayName`, `image`, `alias`).
**Action:** Usar siempre proyecciones de columnas específicas al realizar consultas de relación en Drizzle para mejorar el rendimiento del motor de base de datos y la velocidad de serialización en el servidor Next.js.
