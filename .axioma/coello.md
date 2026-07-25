# Coello — Journal & Backlog

## Última actualización: 2026-07-25

## Estado actual

### Completado
- Spec creada: `specs/player-graph.md`
- Agente creado: `.ants/gallery/coello.md`
- Phase 1 (DB schema): tablas `playerEdges`, `playerGraphStats`, `matchPlayerFeedback` + campo `side` en `matchPlayers`. Migration `drizzle/0002_player_graph.sql` generada.
- Phase 2 (Graph engine): `src/lib/graph/` con `engine.ts` (skill scores iterativos, comunidades BFS, side stats, feedback), `update.ts` (upsert de aristas al confirmar match), `rebuild.ts` (rebuild completo + recompute individual), `index.ts` (barrel).
- Phase 3: Integración de graph update en `confirmMatchResultAction`, `finalizeMatchAction`, y `saveMatchResultAction`. Campo `sides` agregado a `SaveMatchResultInput`.
- Phase 3 (UI): Carga de posición en cancha ("Derecha" / "Revés") agregada a la UI de `src/app/(app)/match/[matchId]/result/page.tsx` y enviada correctamente en la acción.
- Phase 4: Eliminar categoría auto-percibida de toda la UI y backend de la aplicación.
- Phase 5 (Feedback del organizador post-partido):
  - Creados los server actions `getMatchFeedbacksAction` y `savePlayerFeedbackAction` en `src/app/(app)/match/actions.ts` para obtener y persistir el feedback de nivel del organizador, disparando el recalculo automático del score de nivel (`skillScore`) de los jugadores evaluados.
  - Integrado de forma sutil en la UI de asistencia (`src/components/matches/attendance-marker.tsx`) para permitir al organizador calificar con un solo toque si algún invitado jugó a un nivel diferente ("Más fuerte 💪", "Más flojo 📉"), enviándose de forma simultánea junto con la asistencia sin fricción añadida.
- Phase 6 (Recomendaciones de turnos con grafo - PR coello/graph/prioritize-turn-contacts):
  - Refactorizada la función `getTurnNetworkContacts` para implementar una exclusión estricta y global de candidatos con resultados/outcome extremos en rivalidad con cualquiera de los jugadores ya inscritos en el turno.
  - Asegurado que los jugadores excluidos debido a su desequilibrio de nivel no puedan recibir bonificaciones de comunidad ni ser añadidos a la lista final de recomendaciones de rescate del turno.

### Pendiente — Backlog

#### Phase 7: Stats y red social
- [ ] Vista "Tu red": conexiones del jugador
- [ ] Stats de pareja/rival más frecuente
- [ ] Win rate por posición
- [ ] Sugerencia de parejas al armar match

## Learnings
- **Asistencia y Feedback Unificados**: Unificar la marcación de asistencia post-partido y el feedback sutil de nivel en un solo formulario y acción de guardado ("Guardar asistencia y feedback") reduce enormemente la fricción de uso para el organizador de partidos, logrando datos limpios del grafo de manera orgánica y sin requerir flujos de onboarding adicionales.
- **MDS Form Controls**: Al diseñar grupos de botones interactivos personalizados (como los botones de feedback de nivel), usar `role="radiogroup"` y `role="radio"` con estados `aria-checked` e indicadores de focus visibles (`focus-visible:ring-2`) asegura el cumplimiento de accesibilidad para lectores de pantalla sin sacrificar el diseño pulido.
- **Exclusión Global en Grafos de Recomendación**: Al priorizar candidatos utilizando múltiples fuentes de datos (ej. aristas directas de contacto y pertenencia a comunidades del grafo), es crítico mantener un registro unificado de exclusiones (`excludedUserIds`). De lo contrario, un candidato que deba ser estrictamente excluido por una regla de negocio (ej. disparidades extremas de habilidad) podría ser reintroducido incorrectamente a través de un canal secundario (ej. la bonificación de pertenecer a la misma comunidad).
