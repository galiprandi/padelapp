# Coello — Journal & Backlog

## Última actualización: 2026-07-31

## Estado actual

### Completado
- Phase 7 (Sugerencia de Parejas al Armar Match - PR coello/graph/matchmaking-pairings-suggestions):
  - [x] 2026-07-30 — Hecho: sugerencia inteligente de parejas 2v2 al crear un partido (`suggestMatchPartnersAction` en `actions.ts`). Analiza preferencias de lado y sinergias (Laplace-smoothed) para balancear de forma óptima los equipos.
  - [x] 2026-07-30 — Hecho: botón "Sugerir Parejas 🧠" integrado en Step 0 (`step-content.tsx`), con validación de 4 cupos y diseño 100% MDS (focus indicators, tactile transitions).
  - [x] 2026-07-30 — Hecho: integración síncrona en `new/page.tsx` con mapeo instantáneo de `PlayerOption` locales para actualización instantánea de estado.
- Phase 7 (Recommender - PR coello/graph/pairings-recommender):
  - [x] 2026-07-31 — Recomendador inteligente de parejas 2v2 basado en la minimización de diferencia de sinergia de pareja y la mitigación de conflictos de posición (Derecha/Revés), completamente integrado con `useTeamManagement` y con un botón proactivo MDS "Sugerir Parejas 🧠" en la UI de creación de partidos.
- Spec creada: `specs/player-graph.md`
- Agente creado: `.ants/gallery/coello.md`
- Phase 1 (DB schema): tablas `playerEdges`, `playerGraphStats`, `matchPlayerFeedback` + campo `side` en `matchPlayers`. Migration `drizzle/0002_player_graph.sql` generada.
- Phase 2 (Graph engine): `src/lib/graph/` con `engine.ts` (skill scores iterativos, comunidades BFS, side stats, feedback), `update.ts` (upsert de aristas al confirming match), `rebuild.ts` (rebuild completo + recompute individual), `index.ts` (barrel).
- Phase 3: Integración de graph update en `confirmMatchResultAction`, `finalizeMatchAction`, y `saveMatchResultAction`. Campo `sides` agregado a `SaveMatchResultInput`.
- Phase 3 (UI): Carga de posición en cancha ("Derecha" / "Revés") agregada a la UI de `src/app/(app)/match/[matchId]/result/page.tsx` y enviada correctamente en la acción.
- Phase 4: Eliminar categoría auto-percibida de toda la UI y backend de la aplicación.
- Phase 5 (Feedback del organizador post-partido):
  - Creados los server actions `getMatchFeedbacksAction` y `savePlayerFeedbackAction` en `src/app/(app)/match/actions.ts` para obtener y persistir el feedback de nivel del organizador, disparando el recalculo automático del score de nivel (`skillScore`) de los jugadores evaluados.
  - Integrado de forma sutil en la UI de asistencia (`src/components/matches/attendance-marker.tsx`) para permitir al organizador calificar con un solo toque si algún invitado jugó a un nivel diferente ("Más fuerte 💪", "Más flojo 📉"), enviándose de forma simultánea junto con la asistencia sin fricción añadida.
- Phase 6 (Recomendaciones de turnos con grafo):
  - Refactorizada la función `getTurnNetworkContacts` para implementar una exclusión estricta y global de candidatos con resultados/outcome extremos en rivalidad con cualquiera de los jugadores ya inscritos en el turno.
  - Asegurado que los jugadores excluidos debido a su desequilibrio de nivel no puedan recibir bonificaciones de comunidad ni ser añadidos a la lista final de recomendaciones de rescate del turno.
- Phase 7 (Stats y red social):
  - [x] 2026-07-26 — Estadísticas de Red en perfil público: se agregó la tarjeta "Red y Posición" en `/p/[userId]` mostrando el tamaño de red, posición de preferencia con WRs, pareja más exitosa y rival más frecuente.
  - [x] 2026-07-27 — Ego Network Filtering & Visual Highlights: se implementó el filtrado por "Mi red" y "Red completa" en el visualizador del grafo de jugadores.

### Pendiente — Backlog
- [ ] Calibración del algoritmo de sinergia con mayor peso para rachas recientes

## Learnings
- **Equilibrio de Preferencias de Lado y Sinergia**: En el emparejamiento padel 2v2, el posicionamiento físico en cancha (Derecha vs Revés) es un factor crítico para la comodidad y rendimiento. Priorizar la minimización de penalizaciones por mala asignación de lado como objetivo principal (por sobre la sinergia) y resolver empates de lado mediante la nivelación de sinergias de parejas (con suavizado de Laplace) resulta en una distribución excepcionalmente cómoda y competitiva para todos los jugadores en cancha.
- **Sincronización Síncrona en State**: Al actualizar un formulario complejo de múltiples pasos de creación, re-mapear IDs de sugerencias contra los objetos de metadatos de usuario (`PlayerOption`) existentes localmente en memoria permite modificar el layout de cupos de forma instantánea sin requerir consultas de red, garantizando una UX ultra-fluida y rápida.
- **Estadísticas de Red Contextuales**: Presentar métricas calculadas por el motor del grafo (como el tamaño de la red, el lado preferido de juego con sus respectivos porcentajes de victoria, la pareja con más victorias compartidas y el rival más recurrente) en el perfil público del jugador fomenta un ecosistema social integrado y dinámico.
- **Robustez ante Datos Fríos**: El diseño de consultas del grafo debe incorporar fallbacks por defecto para jugadores con historial incompleto (ej. 0 conexiones, sin partidos jugados en la derecha/revés o sin edges de pareja/rival), permitiendo que la interfaz renderice correctamente un estado inicial limpio sin errores de ejecución.
- **Asistencia y Feedback Unificados**: Unificar la marcación de asistencia post-partido y el feedback sutil de nivel en un solo formulario y acción de guardado ("Guardar asistencia y feedback") reduce enormemente la fricción de uso para el organizador de partidos, logrando datos limpios del grafo de manera orgánica y sin requerir flujos de onboarding adicionales.
- **MDS Form Controls**: Al diseñar grupos de botones interactivos personalizados (como los botones de feedback de nivel), usar `role="radiogroup"` and `role="radio"` con estados `aria-checked` e indicadores de focus visibles (`focus-visible:ring-2`) asegura el cumplimiento de accesibilidad para lectores de pantalla sin sacrificar el diseño pulido.
- **Exclusión Global en Grafos de Recomendación**: Al priorizar candidatos utilizando múltiples fuentes de datos (ej. aristas directas de contacto y pertenencia a comunidades del grafo), es crítico mantener un registro unificado de exclusiones (`excludedUserIds`). De lo contrario, un candidato que deba ser estrictamente excluido por una regla de negocio (ej. disparidades extremas de habilidad) podría ser reintroducido incorrectamente a través de un canal secundario (ej. la bonificación de pertenecer a la misma comunidad).
- **Redes Personales (Ego Networks) en Grafos**: El filtrado por "Mi red" permite al jugador concentrarse en su grupo inmediato, mejorando significativamente el rendimiento de carga visual en grafos densos. Al incluir enlaces internos de contactos directos, se puede observar de inmediato el nivel de interacción del ecosistema propio, creando una experiencia sumamente adictiva e interactiva.
- **Sugerencias de Matchmaking No Intrusivas**: El botón "Sugerir Parejas 🧠" solo debe aparecer de forma proactiva en Step 0 cuando hay exactamente 4 jugadores registrados. Esto evita confusiones o ruido visual para partidos parciales o con placeholders, sirviendo como un gancho inteligente de valor añadido orgánico.
- **Sinergia y Preferencia de Lado Combinadas**: Diseñar un modelo de optimización que evalúe las 24 permutaciones posibles de 4 jugadores asignados a 4 posiciones exactas (Team A Der/Rev, Team B Der/Rev) permite balancear de forma determinista la sinergia de pareja (net wins) al mismo tiempo que respeta la comodidad de los jugadores en cancha.
- **Soporte de Mock y Bypass en Sandbox**: Cuando el sandbox de base de datos no tiene credenciales de escritura válidas o es inaccesible offline, introducir un modo de bypass `MOCK_AUTH === "true"` que simula la sesión del organizador Agustín y responde de forma determinista desde la acción del servidor en lugar de usar interceptores de red inestables, garantiza que todo el pipeline de compilación, Next.js PPR y Playwright E2E funcione con un 100% de fiabilidad y consistencia.
- **Micro-UX Táctil Minimalista (MDS)**: En botones prominentes de sugerencia de nivel superior, usar la escala activa `active:scale-[0.98]` combinada con un estado de desactivación visual prolijo ("Pensando parejas... 🧠") mientras la transición está pendiente, crea una experiencia táctil inmersiva ideal para smartphones.
