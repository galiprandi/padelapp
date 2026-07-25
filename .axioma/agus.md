## 📋 BACKLOG

## ✅ DONE
- [x] 2026-07-17 — Corrección del bug de consistencia de posiciones relativas y deltas en `recalculateRankingAction` (PR #1).
- [x] 2026-07-17 — Creación de la sección interactiva `RankingInfo` con explicación de fórmulas, decay, penalizaciones y tiebreak en la página de ranking (PR #1).
- [x] 2026-07-21 — Optimización de consultas de partidos para evitar el over-fetching de datos de usuario (PR #2).
- [x] 2026-07-22 — Resaltado del usuario actual ("Tú") en el podio del ranking para una identificación inmediata (PR #3).
- [x] 2026-07-23 — Implementación de Selección Automática y Visualización de Lado en Resultados de Partido (PR #4).
- [x] 2026-07-24 — Exposición de acción de finalización forzada para organizador en partidos pendientes de confirmación (PR #5).
- [x] 2026-07-25 — Implementación de reseteo de estadísticas para usuarios afectados con 0 partidos y corrección de asimetría en ordenación de ranking (PR #6).

## 🧠 LEARNINGS
### 2026-07-25 - Reseteo de Estadísticas del Ranking y Simetría del Comparador
**Learning:** Al recalcular el ranking de forma incremental, si un jugador se ve afectado y termina con 0 partidos válidos (debido a la cancelación de su único partido, desvinculación o baja de cupo), el código anterior retenía por error los datos anteriores (`wins`, `losses`, `score`, etc.) debido a un fallback mal condicionado. Al detectar correctamente si un usuario se ve afectado por la recalculación (`isUserAffected`) y no tiene registros computados, debemos resetear sus estadísticas a los valores por defecto (1000 score, 1.0 reputación, 0 partidos, null fecha de último partido). Adicionalmente, el comparador de ordenación del ranking tenía una asimetría cuando ambos jugadores a comparar tenían fecha nula de último partido, lo que comprometía la estabilidad del ordenamiento.
**Action:** Al resetear o recalcular conjuntos de datos complejos, siempre asegúrese de limpiar o establecer valores predeterminados explícitamente en lugar de confiar en fallbacks que puedan perpetuar datos antiguos y huérfanos.

### 2026-07-24 - Acción de Finalización Forzada de Partido para Organizadores (UX)
**Learning:** En partidos de liga o torneos casuales de pádel, a menudo algunos jugadores no están registrados (son placeholders con nombre libre) o simplemente olvidan iniciar sesión para confirmar el resultado. Al no tener la aprobación obligatoria de ambos equipos, el partido queda en un limbo (status PENDING) indefinido y sus puntos nunca impactan en el ranking global. Al exponer la acción `finalizeMatchAction` como un botón de "Finalizar como Organizador" para el creador del partido, se empodera al organizador para que resuelva bloqueos inmediatamente y procese el partido sin fricciones.
**Action:** Identificar acciones del backend preexistentes y potentes que no estén expuestas en la interfaz para simplificar la gestión y flujos de usuarios administradores u organizadores.

### 2026-07-23 - Selección Inteligente de Lado de Cancha (Doubles Court-Side Auto-Toggle)
**Learning:** En el pádel, la posición en cancha es mutuamente excluyente por pareja (un jugador juega en el lado de la Derecha y el otro en el de Revés). Al cargar un resultado en la aplicación, si el sistema requiere que los usuarios marquen manualmente cada lado, se genera fricción. Al implementar un auto-toggle inteligente, si el usuario selecciona Derecha para sí mismo, el sistema marca automáticamente Revés para su compañero, ahorrando clics y previniendo configuraciones inválidas.
**Action:** Utilizar patrones de sincronización lógica en elementos mutuamente excluyentes dentro de la misma entidad (ej. parejas, roles) para optimizar la interacción móvil (MDS Maxim 1.8).

### 2026-07-22 - Visualización Personalizada en el Podio (UX)
**Learning:** En las tablas de clasificación o podios de juego competitivo, los jugadores buscan con ansias su propia posición. Resaltar visualmente al usuario actual como "Tú" utilizando la paleta e indicaciones visuales estándar (`bg-primary/5 border-primary/30`) reduce drásticamente el tiempo de reconocimiento visual y potencia la gratificación competitiva de estar en el Top 3.
**Action:** Aplicar patrones similares de personalización con "Tú" en cualquier visualización de estadísticas, listas o podios en todo el sistema.

### 2026-07-21 - Optimización de Consultas en Drizzle (Over-fetching)
**Learning:** El uso predeterminado de relaciones completas (como `user: true` o `with: { user: true }`) en Drizzle ORM puede causar un over-fetching masivo, recuperando columnas pesadas o sensibles que no son utilizadas en la interfaz. Al utilizar la opción `columns` de la consulta de relación, es posible restringir los datos al mínimo requerido (`id`, `displayName`, `image`, `alias`).
**Action:** Usar siempre proyecciones de columnas específicas al realizar consultas de relación en Drizzle para mejorar el rendimiento del motor de base de datos y la velocidad de serialización en el servidor Next.js.

### 2026-07-17 - Consistencia Relativa en Cálculos Incrementales
**Learning:** Al recalcular de forma incremental (`affectedUserIds`), las puntuaciones de los jugadores que no jugaron no cambian, pero su posición relativa en el ranking sí puede cambiar debido al movimiento de otros jugadores. Si se omiten estas actualizaciones, se rompe la secuencia de posiciones y deltas globales.
**Action:** Asegurar que se comparen `oldPosition` and `oldDelta` de todos los usuarios para persistir cualquier desplazamiento colateral.

### 2026-07-17 - Transparencia de Mecánicas de Juego (MDS)
**Learning:** Los sistemas de gamificación como los rankings son mucho más adictivos y motivadores cuando los jugadores entienden las reglas claras (por ejemplo, el decay por inactividad o las penalizaciones por ausencia). Un componente explicativo interactivo y elegante sin fricción visual (MDS Maxim 1.3/1.8) mejora radicalmente el entendimiento.
**Action:** Integrar explicaciones interactivas ligeras (`details` / `useState` toggles) en áreas complejas del producto.
