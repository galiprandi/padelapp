# Player aliases (nickname system)
**Estado**: Implemented (MVP)  
**Ámbito**: Todos los views donde se muestra el nombre de un jugador (partidos, listas, invitaciones, confirmación).  

## Objetivo
Permitir que cada jugador autenticado defina un alias (nickname) propio, distinto del `displayName` de Google, y que la app muestre ese alias por defecto en todas las vistas y flujos de partido/invitación.

## Reglas de negocio
1) El alias es por usuario (no por partido).  
2) Si el usuario define alias, se muestra alias; si no, se usa `displayName` de Google.  
3) Se debe persistir en el perfil del usuario (tabla `User`, campo nuevo `alias` opcional).  
4) Debe respetar validación básica:
   - Largo 2–30 caracteres.
   - Sin solo espacios; trim al guardar.
   - Sin emojis de control ni saltos de línea (permitir letras, números, espacios y puntuación simple).  
5) El alias se usa en:
   - Listado de partidos `/match`.
   - Detalle de partido `/match/[matchId]`.
   - Resultados compactos (`MatchResultCompact`).
   - Modal de gestión de jugadores cuando el slot pertenece al usuario.
   - Flujos de invitación `/j/[playerId]` (al mostrar al ocupante actual).
6) Los slots placeholders siguen usando `displayName` editable (owner), no se confunde con alias.

## Consideraciones UI
- En el perfil (`/me`) o en un modal rápido: campo “Alias (opcional)”.  
- Mostrar hint: “Se mostrará en partidos e invitaciones”.  
- Validación inline; guardar vía Server Action.  
- Toast de éxito/errores reutilizando el sistema actual (toasts top-right).

## Consideraciones técnicas
- Base de datos: agregar columna `alias` a `User` (nullable).  
- Server Actions:
  - Nueva acción `updateUserAliasAction(alias: string | null)` que:
    - Requiere sesión.
    - Valida reglas.
    - Guarda `alias` (o `null` si se borra).
    - Revalida rutas que lean el usuario (`/match`, `/me`, páginas de partido donde participe).  
- Lectura de nombre:
  - Crear helper `getUserDisplayName(user)` que priorice `user.alias ?? user.displayName`.
  - Usarlo en componentes que renderizan nombres (MatchResultCompact, MatchPlayersManager, etc.).

## Pendientes/Integración
- Ajustar specs de invitación una vez se soporte alias en `/j/[playerId]` y listados.

## Estado futuro
- Cuando exista ranking, usar alias en tablas, pero mostrar `displayName` en tooltip secundario (opcional).
