## 📋 BACKLOG
- [ ] Filtro de Actividad en Ranking: Tópico para filtrar jugadores inactivos (sin partidos en los últimos 30 días) para mantener la tabla global competitiva y dinámica.

## ✅ DONE
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
### 2026-08-01 - Desglose Detallado del Puntaje de Clasificación (Interactividad y Transparencia)
**Learning:** El ranking es un factor clave en la retención del usuario, pero cuando las reglas y fórmulas de juego no son transparentes, los jugadores pierden motivación. Al incorporar un desglose interactivo ("Ver desglose de puntos") mediante un Server Action perezoso y un componente colapsable con estado de transición (`useTransition`), dotamos al usuario de total transparencia matemática de inmediato sin sobrecargar el primer renderizado de la página, ni incurrir en Cumulative Layout Shift (CLS), manteniendo el pre-renderizado parcial (PPR) de Next.js al 100% optimizado.
**Action:** Utilizar siempre carga bajo demanda (on-demand lazy fetching) para bloques de datos secundarios complejos y detallados, combinando Server Actions con transiciones de React 19 para mantener la interfaz ultra-reactiva y libre de CLS.

### 2026-07-31 - Acción de Confirmación Contextual en Ranking (Gamificación)
**Learning:** El ranking es el principal gancho de engagement (gamificación) del producto. Al permitir que el usuario visualice sus acciones de confirmación pendientes y resuelva sus partidos directamente desde la página de `/ranking`, cerramos el ciclo de feedback de manera inmediata. Confirmar un resultado actualiza instantáneamente sus puntos, victorias y posición en pantalla gracias a `router.refresh()`, ofreciendo una experiencia altamente reactiva, satisfactoria y motivadora para seguir participando.
**Action:** Diseñar siempre las interfaces críticas de estadísticas vinculadas de forma directa con los CTA de acción rápida que alimentan esos mismos datos para simplificar el flujo del usuario.

### 2026-07-28 - Integridad de la Arquitectura de PPR y Compilación de Producción
**Learning:** Al utilizar Next.js con pre-renderizado parcial (PPR) habilitado de forma global, asegurar que las consultas y operaciones dinámicas (como leer cookies, cabeceras o la sesión actual mediante `auth()`) estén debidamente aisladas en subcomponentes asíncronos y envueltas en límites de `<Suspense>` garantiza que las páginas puedan generar su esqueleto estático de forma inmediata y transmitir el contenido dinámico de manera incremental. La compilación estática (`next build`) confirma que no hay fugas de llamadas dinámicas no controladas en las páginas pre-renderizadas, manteniendo la velocidad de carga óptima y previniendo Cumulative Layout Shift (CLS).
**Action:** Mantenga siempre las llamadas dinámicas o promesas que dependan de searchParams o sesiones alejadas del componente del shell exterior para asegurar la compatibilidad con PPR.

### 2026-07-27 - Semántica y Accesibilidad en Deltas de Posición de Clasificación
**Learning:** El valor del delta en una clasificación o ranking representa el desplazamiento relativo de posiciones (subió o bajó N puestos), no los puntos obtenidos en los partidos. El uso descuidado de términos (ej. "puntos" en lugar de "posiciones" en los atributos ARIA) confunde a usuarios de lectores de pantalla y deteriora la accesibilidad. Al unificar la visualización de deltas tanto en listas de clasificación, podios de honor (`RankingPodium`), como en banners personales (`UserRankingBanner`), y dotar a cada uno de un etiquetado ARIA exacto y descriptivo en español, se crea una experiencia altamente accesible y libre de ambigüedades.
**Action:** En cualquier visualización de estadísticas relativas, verifique que la terminología en pantalla y en las etiquetas ARIA coincida exactamente con la naturaleza del dato medido para evitar desorientar a los usuarios de tecnologías asistivas.

### 2026-07-26 - Gating de Funciones Dinámicas (New Date()) en Pre-renderizado
**Learning:** En Next.js con Partial Prerendering (PPR), durante la fase de compilación estática (`next build`), el compilador intentará evaluar las páginas estáticas (como `/catalog`) que importen o incorporen componentes del lado del cliente. Si estos componentes evalúan de forma directa y fuera de hooks funciones dinámicas inestables como `new Date()` para calcular deltas de tiempo, Next.js abortará la compilación debido a la evaluación de valores dinámicos inestables durante la compilación estática. Gating del constructor `new Date()` utilizando una comprobación de montaje (`useMounted()`) en un bloque de renderizado condicional asegura que la función dinámica no se ejecute en el servidor durante la compilación, garantizando una hidratación perfecta y 100% de compatibility con PPR.
**Action:** Al interactuar con fechas del sistema actual o APIS de navegador en componentes compartidos, asegure que se utilicen comprobaciones de montaje (`mounted`) y constructores diferidos dentro de los bloques de renderizado para evitar fallos de pre-renderizado.

### 2026-07-25 - Reseteo de Estadísticas del Ranking y Simetría del Comparador
**Learning:** Al recalcular el ranking de forma incremental, si un jugador se ve afectado y termina con 0 partidos válidos (debido a la cancelación de su único partido, desvinculación o baja de cupo), el código anterior retenía por error los datos anteriores (`wins`, `losses`, `score`, etc.) debido a un fallback mal condicionado. Al detectar correctamente si un usuario se ve afectado por la recalculación (`isUserAffected`) y no tiene registros computados, debemos resetear sus estadísticas a los valores por defecto (1000 score, 1.0 reputación, 0 partidos, null fecha de último partido). Adicionalmente, the comparador de ordenación del ranking tenía una asimetría cuando ambos jugadores a comparar tenían fecha nula de último partido, lo que comprometía la estabilidad del ordenamiento.
**Action:** Al resetear o recalcular conjuntos de datos complejos, siempre asegúrese de limpiar o establecer valores predeterminados explícitamente en lugar de confiar en fallbacks que puedan perpetuar datos antiguos y huérfanos.

### 2026-07-24 - Acción de Finalización Forzada de Partido para Organizadores (UX)
**Learning:** En partidos de liga o torneos casuales de pádel, a menudo algunos jugadores no están registrados (son placeholders con nombre libre) o simplemente olvidan iniciar sesión para confirmar el resultado. Al no tener la aprobación obligatoria de ambos equipos, el partido queda en un limbo (status PENDING) indefinido y sus puntos nunca impactan en el ranking global. Al exponer la acción `finalizeMatchAction` como un botón de "Finalizar como Organizador" para el creador del partido, se empodera al organizador para que resuelva bloqueos inmediatamente y procese el partido sin fricciones.
**Action:** Identificar acciones del backend preexistentes y potentes que no estén expuestas en la interfaz para simplificar la gestión y flujos de usuarios administradores u organizadores.

### 2026-07-23 - Selección Inteligente de Lado de Cancha (Doubles Court-Side Auto-Toggle)
**Learning:** En el pádel, la posición en cancha es mutuamente excluyente por pareja (un jugador juega en el lado de la Derecha y el otro en el de Revés). Al cargar un resultado en la aplicación, si el sistema requiere que los usuarios marquen manualmente cada lado, se genera fricción. Al implementar un auto-toggle inteligente, si el usuario selecciona Derecha para sí mismo, el sistema marca automáticamente Revés para su compañero, ahorrando clics y previniendo configuraciones inválidas.
**Action:** Utilizar patrones de sincronización lógica en elementos mutuamente excluyentes dentro de la misma entidad (ej. parejas, roles) para optimizar la interacción móvil (MDS Maxim 1.8).

### 2026-07-22 - Visualización Personalizada en el Podio (UX)
**Learning:** En las tablas de clasificación o podios de juego competitivo, los jugadores buscan con ansias su propia posición. Resaltar visualmente al usuario actual como "Tú" utilizando la paleta e indicaciones visuales estándar (`bg-primary/5 border-primary/30`) reduce drásticamente el tiempo de recognition visual y potencia la gratificación competitiva de estar en el Top 3.
**Action:** Aplicar patrones similares de personalización con "Tú" en cualquier visualización de estadísticas, listas o podios en todo el sistema.

### 2026-07-21 - Optimización de Consultas en Drizzle (Over-fetching)
**Learning:** El uso predeterminado de relaciones completas (como `user: true` o `with: { user: true }`) en Drizzle ORM puede causar un over-fetching masivo, recuperando columnas pesadas o sensibles que no son utilizadas en la interfaz. Al utilizar la opción `columns` de la consulta de relación, es posible restringir los datos al mínimo requerido (`id`, `displayName`, `image`, `alias`).
**Action:** Usar siempre proyecciones de columnas específicas al realizar consultas de relación en Drizzle para mejorar el rendimiento del motor de base de datos y la velocidad de serialización en el servidor Next.js.

### 2026-07-17 - Consistencia Relativa en Cálculos Incrementales
**Learning:** Al recalcular de forma incremental (`affectedUserIds`), las puntuaciones de los jugadores que no jugaron no cambian, pero su posición relativa en el ranking sí puede cambiar debido al movimiento de otros jugadores. Si se omiten estas actualizaciones, se rompe la secuencia de posiciones y deltas globales.
**Action:** Asegurar que se comparen `oldPosition` and `oldDelta` de todos los usuarios para persistir cualquier desplazamiento colateral.

### 2026-07-17 - Transparencia de Mecánicas de Juego (MDS)
**Learning:** Los sistemas de gamificación como los rankings son mucho más adictivos y motivadores cuando los jugadores entienden las reglas claras (por ejemplo, el decay por inactividad o las penalizaciones por ausencia). Un componente explicativo interactivo y elegante sin fricción visual (MDS Maxim 1.3/1.8) mejora radicalmente el entendimiento.
**Action:** Integrar explicaciones interactivas ligeras (`details` / `useState` toggles) in áreas complejas del producto.
