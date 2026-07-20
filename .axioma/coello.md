# Coello — Journal & Backlog

## Última actualización: 2026-07-18

## Estado actual

### Completado
- Spec creada: `specs/player-graph.md`
- Agente creado: `.ants/gallery/coello.md`
- Phase 1 (DB schema): tablas `playerEdges`, `playerGraphStats`, `matchPlayerFeedback` + campo `side` en `matchPlayers`. Migration `drizzle/0002_player_graph.sql` generada.
- Phase 2 (Graph engine): `src/lib/graph/` con `engine.ts` (skill scores iterativos, comunidades BFS, side stats, feedback), `update.ts` (upsert de aristas al confirmar match), `rebuild.ts` (rebuild completo + recompute individual), `index.ts` (barrel).
- Phase 3: Integración de graph update en `confirmMatchResultAction`, `finalizeMatchAction`, y `saveMatchResultAction`. Campo `sides` agregado a `SaveMatchResultInput`.
- Phase 3 (UI): Carga de posición en cancha ("Derecha" / "Revés") agregada a la UI de `src/app/(app)/match/[matchId]/result/page.tsx` y enviada correctamente en la acción.
- Phase 4: Eliminar categoría auto-percibida de toda la UI y backend de la aplicación:
  - Selector de nivel quitado de `/me/profile` (`profile-form.tsx` y `page.tsx`).
  - Campo `level` removido de NextAuth session callbacks y types.
  - `suggestedLevel` y alertas de nivel quitados de creación y edición de turnos.
  - Badges y labels de nivel quitados de tarjetas de turno, detalles del turno, detalles de partido, perfiles de jugador, ranking e items de lista.

### Pendiente — Backlog

#### Phase 5: Feedback del organizador post-partido
- [ ] Crear server action `savePlayerFeedbackAction` en match actions
- [ ] UI: opción sutil al confirmar resultado para marcar "más fuerte"/"más flojo"
- [ ] Integración con grafo (applyFeedbackToScore ya existe en engine)

#### Phase 6: Recomendaciones de turnos con grafo
- [ ] Reemplazar `getTurnNetworkContacts` con versión priorizada por grafo
- [ ] Filtro por comunidad + peso de arista + outcome

#### Phase 7: Stats y red social
- [ ] Vista "Tu red": conexiones del jugador
- [ ] Stats de pareja/rival más frecuente
- [ ] Win rate por posición
- [ ] Sugerencia de parejas al armar match

## Learnings
- **Match Player Side Selection**: Integrar sutilmente la posición en cancha ("Derecha" / "Revés") en el momento de cargar los resultados del partido enriquece el grafo de conexiones de forma natural y sin fricciones de onboarding.
- **Eliminación de Categoría Auto-percibida**: Quitar los selectores subjetivos de nivel (1-8) de los perfiles y turnos simplifica enormemente la UX móvil de la aplicación, dejando que la red y el grafo de jugadores decidan la compatibilidad de forma orgánica e interna.
- **Seguridad en DB**: Al remover un campo requerido por la base de datos (como `suggestedLevel` en turnos), lo más seguro para evitar romper integraciones o fallar queries SQL es hacerlo opcional en los inputs de los server actions y asignar un default seguro (como 6) en el backend.
