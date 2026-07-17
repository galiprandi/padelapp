## 📋 BACKLOG
- [ ] Optimizar la query `getEnhancedUserMatches` para evitar el over-fetching de datos.

## ✅ DONE
- [x] 2026-07-17 — Corrección del bug de consistencia de posiciones relativas y deltas en `recalculateRankingAction` (PR #1).
- [x] 2026-07-17 — Creación de la sección interactiva `RankingInfo` con explicación de fórmulas, decay, penalizaciones y tiebreak en la página de ranking (PR #1).

## 🧠 LEARNINGS
### 2026-07-17 - Consistencia Relativa en Cálculos Incrementales
**Learning:** Al recalcular de forma incremental (`affectedUserIds`), las puntuaciones de los jugadores que no jugaron no cambian, pero su posición relativa en el ranking sí puede cambiar debido al movimiento de otros jugadores. Si se omiten estas actualizaciones, se rompe la secuencia de posiciones y deltas globales.
**Action:** Asegurar que se comparen `oldPosition` y `oldDelta` de todos los usuarios para persistir cualquier desplazamiento colateral.

### 2026-07-17 - Transparencia de Mecánicas de Juego (MDS)
**Learning:** Los sistemas de gamificación como los rankings son mucho más adictivos y motivadores cuando los jugadores entienden las reglas claras (por ejemplo, el decay por inactividad o las penalizaciones por ausencia). Un componente explicativo interactivo y elegante sin fricción visual (MDS Maxim 1.3/1.8) mejora radicalmente el entendimiento.
**Action:** Integrar explicaciones interactivas ligeras (`details` / `useState` toggles) en áreas complejas del producto.
