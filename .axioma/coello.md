# Coello — Journal & Backlog

## Última actualización: 2026-07-18

## Estado actual

### Completado
- Spec creadada: `specs/player-graph.md`
- Agente creado: `.ants/gallery/coello.md`
- Phase 1 (DB schema): tablas `playerEdges`, `playerGraphStats`, `matchPlayerFeedback` + campo `side` en `matchPlayers`. Migration `drizzle/0002_player_graph.sql` generada.
- Phase 2 (Graph engine): `src/lib/graph/` con `engine.ts` (skill scores iterativos, comunidades BFS, side stats, feedback), `update.ts` (upsert de aristas al confirmar match), `rebuild.ts` (rebuild completo + recompute individual), `index.ts` (barrel).
- Phase 3 (parcial): integración de graph update en `confirmMatchResultAction`, `finalizeMatchAction`, y `saveMatchResultAction`. Campo `sides` agregado a `SaveMatchResultInput`.

### Pendiente — Backlog

#### Phase 3 (incompleta)
- [ ] Agregar toggle de derecha/revés en la UI de `src/app/(app)/match/[matchId]/result/page.tsx`
- [ ] Enviar `sides` en el `saveMatchResultAction` call desde la UI

#### Phase 4: Eliminar categoría auto-percibida
- [ ] Quitar selector de nivel de `src/app/(app)/me/profile/profile-form.tsx`
- [ ] Quitar `level` de sesión en `src/auth.ts`
- [ ] Quitar `suggestedLevel` de `src/app/(app)/turnos/nuevo/page.tsx`
- [ ] Quitar `suggestedLevel` de `src/app/(app)/turnos/[id]/editar/page.tsx`
- [ ] Quitar `levelOptions` de `src/lib/mock-data.ts`
- [ ] Quitar badges "Nivel X" de: `turn-card.tsx`, `/t/[id]/page.tsx`, `/m/[matchId]/page.tsx`, `/ranking/page.tsx`, `/p/[userId]/page.tsx`, dashboard
- [ ] Quitar `level` de `src/lib/queries/contacts.ts` (PadelContact interface)
- [ ] Quitar `level` de `src/app/(app)/me/actions.ts` (updateUserProfileAction)

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
- El grafo usa una sola tabla de aristas (`playerEdges`) con rivalidad + pareja combinadas.
- El algoritmo de skill score es un promedio ponderado iterativo (10 iteraciones), no PageRank.
- Las comunidades se detectan con BFS conectado (simplificación de Louvain, mejorable).
- El feedback del organizador ajusta el score con un factor que se diluye (max 5 feedbacks).
- `users.level` queda como legacy en DB, no se borra.
