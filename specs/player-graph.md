# Especificación: Grafo de Jugadores y Red de Contactos

- Path: `/red` (futuro), integraciones en `/me`, `/turnos`, `/match`
- Estado: Not Implemented
- Público: solo usuarios autenticados

## Objetivo
- Eliminar la categoría auto-percibida como referencia para armar partidos.
- Construir un grafo de jugadores derivado de partidos confirmados que capture cercanía (quién juega con quién), nivel real (quién le gana a quién), y compatibilidad de parejas (quién gana con quién).
- Usar el grafo para: recomendar jugadores para turnos con cupos libres, sugerir parejas balanceadas, mostrar stats reales por posición (derecha/revés), y construir una red social de pádel.

## Motivación
La categoría auto-percibida (1-8) genera sesgo: los jugadores se auto-clasifican mal, y eso no debe influir en el armado de partidos. La mejor confirmación de tu nivel es que te inviten a jugar con gente que juega parecido a vos. El grafo captura eso automáticamente. La red crece orgánicamente: a medida que te invitan y jugás, se crean conexiones.

---

## Cambios principales

### 1. Eliminar la categoría auto-percibida
- Quitar el selector de nivel del perfil de usuario.
- Quitar `level` de la sesión y de toda la UI.
- Quitar `suggestedLevel` como selector en creación/edición de turnos.
- Quitar el warning de mismatch de nivel en edición de turnos.
- Quitar los badges "Nivel X" en: turn card, vista de turno, match detail, ranking, perfil público, dashboard.
- Quitar `levelOptions` de `mock-data.ts`.
- `users.level` queda en DB como legacy (no se borra, no se edita, no se muestra).

### 2. Construir el grafo de jugadores
- **Nodos**: cada jugador que jugó al menos un partido confirmado.
- **Grafo único** con aristas que capturan rivalidad y pareja en una sola relación:
  - Partidos como rivales, partidos como pareja, wins A vs B, wins juntos, última fecha, posición de juego (derecha/revés).
- **Pesos de arista**: frecuencia, cercanía temporal, outcome direccional (rivalidad), synergy (pareja).
- **Score auto-computado**: algoritmo interno (no visible para el usuario). Se calcula en base a resultados reales. **El usuario nunca ve ni escucha sobre este cálculo** — es solo fuente de datos para recomendaciones.
- **Comunidades**: clusters naturales de jugadores que comparten cancha frecuentemente (Louvain). Usado internamente para priorizar recomendaciones.
- **Sin cold start especial**: un jugador nuevo empieza con score neutral. A medida que lo invitan y juega, su red y su score se ajustan automáticamente.

### 3. Feedback del organizador (post-partido)
- **Escenario real**: el organizador invita a alguien que no conoce desesperado por llenar el turno, y resulta que juega mucho más fuerte o mucho más flojo que el grupo.
- Después del partido, el organizador puede marcar a ese jugador como "jugó más fuerte que el grupo" o "jugó más flojo que el grupo".
- No bloquea nada. Es feedback, no veto.
- Esta señal ayuda a calibrar más rápido el score del jugador. Se diluye a medida que acumula partidos reales.
- UX: opción sutil al confirmar el resultado o marcar asistencia.

### 4. Valor del grafo

#### Salvage inteligente de turnos
- Cuando un turno tiene cupos libres, notificar a la red priorizando:
  1. Contactos directos de los anotados (distancia 1 en el grafo).
  2. Mismo cluster de comunidad (cercanía de nivel).
  3. Peso de arista más alto (frecuencia + cercanía temporal).
  4. Excluir rivales con outcome extremo (>85% o <15%).

#### Sugerencia de parejas y cruces
- Sugerir la combinación de parejas con menor diferencia de synergy.
- Evitar parejas donde ambos juegan del mismo lado.

#### Stats reales por jugador
- Posición preferida (derecha/revés/ambidiestro).
- Win rate por posición.
- Rival más frecuente. Pareja más exitosa.
- Tamaño de red.

#### Red social de pádel
- "Tu red": conexiones del jugador, frecuencia de juego, stats.
- Descubrimiento: turnos recomendados de tu comunidad con cupos.
- "Jugadores como vos": contactos del mismo cluster que nunca jugaste con ellos.

---

## Posición de juego: derecha / revés

- Al cargar el resultado del match, toggle de la pareja para indicar quién jugó de derecha y quién de revés.
- Opcional — si no se marca, no rompe nada.
- Default inteligente: el jugador con mayor frecuencia histórica de revés juega revés.
- Alimenta: stats del jugador, sugerencia de parejas, detección de ambidiestros.

---

## Persistencia y cómputo

- Postgres (Neon). Sin infra nueva.
- Tablas: `player_edges`, `player_graph_stats`, `match_player_feedback`.
- Las aristas son derivadas — la source of truth son los partidos confirmados.
- Al confirmar un match: actualizar aristas (6 upserts, instantáneo).
- Batch periódico (Vercel Cron): recalcular scores + comunidades.
- Diseñado para 100k jugadores.
