# Especificación flujo invitación y unión a partido

- Rutas implicadas: `/match/[matchId]`, `/j/[playerId]`
- Estado: Not Implemented

## Objetivo
Unificar el flujo de invitación y confirmación de jugadores utilizando el propio registro `MatchPlayer` como cupo compartible. El enlace `/j/:playerId` se entrega a cada invitado. Cuando un usuario autenticado accede y el cupo sigue libre, se vincula al partido y se marca su fecha de unión. Si el cupo ya está ocupado se devuelve el mensaje en español: “Cupo ocupado, hablá con el organizador del partido.”

## Cambios de modelo de datos
Comparado con `prisma/schema.prisma` actual (`MatchPlayer` + `MatchInvitation`), se requieren los siguientes ajustes:

1. `MatchPlayer`
   - Mantener `id`, `matchId`, `userId` y `position`.
   - Reemplazar `confirmed` por `resultConfirmed Boolean @default(false)` (mantiene la lógica de confirmación de resultado por pareja). Más adelante se puede migrar a `resultConfirmedAt` si se necesita timestamp.
   - Añadir columnas:
     - `displayName String?` (alias editable mientras el cupo está libre).
     - `teamId String?` (FK opcional a la nueva tabla `Team`; permite agrupar slots por pareja o single).
     - `joinedAt DateTime?` (fecha/hora en la que el usuario toma el cupo).
     - `createdAt DateTime @default(now())` y `updatedAt DateTime @updatedAt` (consistencia con el resto del modelo).
   - Constraint nueva: `@@unique([matchId, userId])` para impedir que un jugador ocupe dos cupos del mismo partido. Prisma requiere usar un índice parcial para permitir `null`; se definirá manualmente o mediante SQL raw.

2. `Team` (nueva tabla persistente orientada a ranking histórico)
   - Campos mínimos: `id String @id @default(cuid())`, `label String`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`.
   - Relaciones: `matchPlayers MatchPlayer[]` (un equipo se reutiliza en múltiples partidos). En esta iteración no se guardan owners ni jugadores fijos; esos campos llegarán al implementar el ranking histórico.
   - `label` por defecto se genera como “Pareja A” o “Pareja B” al crear partidos dobles (singles puede dejar “Jugador A”/“Jugador B” si se desea). El owner puede editar el label en el formulario de creación y en la vista de detalle. Más adelante, cuando exista la sección de equipos, cualquier integrante del equipo podrá renombrarlo desde allí.

3. `MatchInvitation`
   - Tabla deja de existir. Se elimina del esquema junto con `generateMagicToken` y cualquier lógica asociada. No se conservan datos legacy porque la app aún no está en producción.

4. `User`
   - Dejar de crear usuarios “fantasma” durante la carga de invitaciones. Solo existen usuarios reales autenticados vía Google OAuth.

### Consideraciones para la base de datos
- No se redactarán migraciones incrementales. En esta iteración se recreará la BD desde cero (`prisma migrate reset` o equivalente Docker) para reflejar el nuevo esquema, ya que no hay datos productivos.
- Aun así, el esquema debe contemplar el constraint parcial (`@@unique([matchId, userId])`) y los campos nuevos en `MatchPlayer`.

## Cambios funcionales necesarios en código
Referencias primarias: `src/app/(app)/match/actions.ts`, `src/app/(app)/match/[matchId]/page.tsx`, `src/app/m/[matchId]/actions.ts`, `src/lib/magic-link.ts`.

1. **Creación de partido (`createMatchAction`)**
   - Dejar de generar usuarios e invitaciones por email; en su lugar crear registros `MatchPlayer`:
     - Slot del owner: `userId = session.user.id`, `displayName = null`, `joinedAt = now`, `teamId` asignada a una de las dos parejas.
     - Slots libres: `userId = null`, `displayName` provista por el owner, `joinedAt = null`, `teamId` precargada, `resultConfirmed = false`.
   - Agregar switch “Dobles / Singles” en el flujo de creación. Si el owner elige dobles se generan cuatro slots y dos equipos (“Pareja A”/“Pareja B”). Si elige singles se generan dos slots y dos equipos (“Jugador A”/“Jugador B” o similar).
   - El response ya no devuelve `invitations` con tokens; en su lugar entregar un arreglo de `slots` con `{ playerId, displayName, teamLabel, link }`, donde `link = new URL(`/j/${player.id}`, origin)`.

2. **Detalle de partido (`/match/[matchId]`)**
   - Eliminar referencias a `match.invitations`.
   - Renderizar cada slot con:
     - Nombre real si `userId` está presente.
     - `displayName` editable (solo owner) si el slot está libre.
     - Botón “Liberar cupo” para owner cuando el slot está ocupado.
     - `team.label` como encabezado de cada pareja/equipo para reforzar la identidad en la UI.
   - Sección “Compartir” debe listar los links `/j/:playerId` individuales.

3. **Acciones de resultado**
   - Actualizar `submitMatchResultAction` y `ConfirmResultButton` para usar `resultConfirmed` en lugar de `confirmed`.
   - Mantener la lógica existente: un jugador de cada pareja debe confirmar para sumar puntos. Cuando el ranking esté implementado, este campo disparará la sumatoria.

4. **Nueva ruta `/j/[playerId]`**
   - Server Component + Server Action que:
     1. Exige sesión (redirige a `/login` en caso contrario).
     2. Busca `MatchPlayer` por `id` e incluye `match` y `team`.
     3. Si `match.status !== PENDING`, bloquear unión.
     4. Si `userId` ya está asignado, mostrar “Cupo ocupado, hablá con el organizador del partido.”
     5. Verificar que el usuario no ocupa otro slot del mismo `matchId` (validación espejo de la constraint).
     6. Caso válido → actualizar registro con `userId = session.user.id`, `displayName = null`, `joinedAt = now`.
     7. Tras vincular, redirigir a `/match/[matchId]` con toast de éxito.

5. **Liberar cupo**
   - Acción exclusiva del owner que limpia `userId`, `joinedAt` y `resultConfirmed`, preserva/edita `displayName`. El `player.id` permanece para que el link siga válido.

6. **Renombrar displayName**
   - Modal inline para el owner sobre slots libres. Server Action solo permite edición cuando `userId` es `null`.

7. **Renombrar equipos**
   - El owner puede editar `team.label` desde la vista de detalle. En la futura sección de equipos, cualquier integrante podrá renombrar su equipo, pero eso queda fuera de esta iteración.

## Consideraciones de seguridad
- Todas las mutaciones (`join`, `liberar`, `renombrar`) deben ser Server Actions para evitar manipulación del `playerId`.
- Con la constraint `@@unique([matchId, userId])`, la DB refuerza la regla del cupo único; la lógica de negocio debe manejar errores de constraint y mostrar mensaje amigable.

## Posibles problemas al implementar
- `src/lib/magic-link.ts` pierde uso del recurso `match` con tokens; revisar y limpiar funciones muertas.
- Componentes existentes asumen cuatro jugadores y `confirmed`; revisar `ConfirmResultButton`, `ResultDialog`, listados en `/match`.
- La generación de `team.label` debe ser consistente entre creación y edición (ej. mapear posiciones 0-1 → “Pareja A”, 2-3 → “Pareja B”).

## Preguntas abiertas
- Ninguna para esta iteración; los ajustes futuros (renombrado por integrantes, hand preference, ranking) se documentarán en specs específicas.

## Validaciones y tests requeridos
- **Server Actions**: pruebas unitarias o de integración sobre `join` y `liberar` para garantizar que solo usuarios autenticados pueden mutar `MatchPlayer` y que la regla `matchId + userId` impide tomar dos cupos.
- **Estado del partido**: verificación de que `/j/:playerId` rechaza uniones cuando `match.status !== PENDING`.
- **Mensaje de cupo ocupado**: test UI/e2e que confirme que se muestra exactamente “Cupo ocupado, hablá con el organizador del partido.” cuando el slot ya está asignado.
- **Edición de displayName**: cobertura que asegura que solo el owner puede actualizar `displayName` de slots libres y que el valor persiste.
- **Confirmación de resultado**: prueba que valide la transición de `resultConfirmed` y que ambos equipos deben confirmar para habilitar el cálculo de ranking.
