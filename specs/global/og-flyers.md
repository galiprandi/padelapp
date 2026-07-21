# Spec: Sistema de Flyers Dinámicos (OG)

- **Estado:** Not Implemented
- **Prioridad:** MVP (engagement + growth + salvage)
- **Owners:** Agus (match flyers), Tino (OG infra + ranking flyers), Roby (perfil flyers)
- **Última actualización:** 2026-07-21

## Resumen

Sistema de imágenes OG (Open Graph) dinámicas generadas con la convención nativa `opengraph-image.tsx` de Next.js 15. Cada segmento de ruta compartible (`/m/[matchId]`, `/ranking`, `/p/[userId]`) tiene su propio `opengraph-image.tsx` **inteligente** que consulta el estado del recurso y genera la variante de flyer que mejor cumpla el objetivo de sharing en ese momento.

El sistema tiene una **finalidad transversal**: engagement, viralidad y growth. Cada flyer está diseñado para que el usuario lo comparta en WhatsApp y genere una reacción emocional (orgullo, revancha, FOMO, curiosidad) que atraiga nuevos usuarios a la app.

## Motivo

Tres misiones de Padel Red se cumplen con un solo sistema:

1. **Salvar turnos**: los flyers de partido en fase de reclutamiento amplifican el alcance del link compartible — los jugadores lo comparten en WhatsApp para llenar cupos, no solo el organizador.
2. **Engagement competitivo**: los flyers de resultado (winner-forward) y de ranking personal convierten cada partido y cada posición en marketing orgánico. El ranking es un hook, y compartirlo amplifica la rivalidad sana fuera de la app.
3. **Growth**: cada link compartido en WhatsApp es una puerta de entrada para nuevos usuarios. El flyer es el primer contacto con la app — tiene que ser vistoso, claro, y generar curiosidad suficiente para hacer click.

## Filosofía de diseño

- **Winner-forward**: cuando hay un ganador, el flyer le da protagonismo visual dominante. El ganador lo comparte para gozar, el perdedor lo ve y quiere la revancha. Esa tensión es el motor de engagement.
- **Personal sobre global**: los flyers de ranking muestran al usuario vs sus conocidos, no el top global. La chicana con gente que conocés es más viral que un top anónimo.
- **Contextual al estado**: el flyer se adapta al estado del recurso (partido en reclutamiento, armado, con resultado; usuario en ranking con habituales cercanos). Nunca es estático.
- **Branding consistente**: todos los flyers comparten paleta amarilla Padel Red, logo, y CTA "Ver en Padel Red". La consistencia construye identidad de marca en cada share.
- **Mobile-first visual**: el flyer se ve en WhatsApp preview (1200x630), tiene que ser legible en thumbnail pequeño.

## Arquitectura técnica

### Approach
- **Convención nativa Next.js 15**: `opengraph-image.tsx` en el segmento de la ruta. Next.js:
  - Sirve la imagen automáticamente en `/<ruta>/opengraph-image`
  - Inyecta `<meta property="og:image">` en el HTML sin configuración manual
  - Maneja content-type, caching y `ImageResponse` de `next/og` nativamente
- **Stack**: `next/og` (`ImageResponse`) — renderiza JSX → SVG → PNG. Edge runtime.
- **Layout base**: 1200x630px. Header Padel Red (logo + paleta amarilla). Footer: link + CTA.
- **Fuente**: Inter o system font embebida (necesaria para `ImageResponse`).
- **Caching**: `export const revalidate` + `unstable_cache` con tags. Invalidación vía `revalidateTag` en las actions que cambian el estado del recurso (`confirmMatchResult`, `joinMatch`, `leaveMatch`, recalculo de ranking, etc.).

### Patrón reutilizable
Cada `opengraph-image.tsx` sigue el mismo patrón:
1. Lee el recurso desde DB (Drizzle) usando las queries existentes.
2. Determina la fase/variante según el estado.
3. Renderiza el layout correspondiente con `ImageResponse`.
4. Exporta `size`, `contentType`, `alt` según convención Next.js.

### Componente compartido
- `src/components/og/flyer-layout.tsx` — layout base reutilizable (header, footer, paleta, tipografías). Cada variante lo usa como wrapper.
- `src/components/og/match-flyer.tsx` — variantes de partido (4 fases).
- `src/components/og/ranking-flyer.tsx` — variante de ranking personal.
- `src/components/og/profile-flyer.tsx` — variante de perfil.

---

## Caso 1: Match (`/m/[matchId]`)

### Fases compartibles

El `MatchStatus` enum (`PENDING`, `CONFIRMED`, `DISPUTED`, `CANCELLED`) no captura todas las fases. Hay sub-estados dentro de `PENDING` derivados de `matchPlayers` (cupos), `match.score` (resultado cargado), `match.date` (futuro/pasado), y `matchPlayers.resultConfirmed` (confirmación).

| Fase | Trigger | Objetivo | Hook emocional | CTA |
|---|---|---|---|---|
| **1. Reclutamiento** | `PENDING` + cupos libres (`matchPlayers` < 4) | Llenar el partido | FOMO / urgencia | "Sumate, faltan X" |
| **2. Armado** | `PENDING` + 4 jugadores + `date` futuro + sin `score` | Generar expectativa / chicana previa | Anticipación, rivalidad | "Hoy se define" |
| **3. Esperando confirmación** | `PENDING` + `score` cargado + no todos confirmaron | Cerrar el resultado | Tensión, cierre | "Confirmá el resultado" |
| **4. Resultado** | `CONFIRMED` + `score` | Winner-forward | Orgullo / revancha | "Ver resultado" |
| **5. Disputado** | `DISPUTED` | Interno — no se comparte | — | (fallback genérico) |
| **6. Cancelado** | `CANCELLED` | No se comparte | — | (no renderiza flyer) |

### Fases 1-3: flyer de invitación (variante por sub-fase)

- **Layout balanceado**: parejas/cupos, fecha, club.
- **Fase 1 (reclutamiento)**: destacar cupos libres con número grande. CTA "Sumate, faltan X".
- **Fase 2 (armado)**: parejas enfrentadas balanceadas, fecha destacada. CTA "Hoy se define". Chicana visual: vs bien grande.
- **Fase 3 (esperando confirmación)**: score cargado visible pero atenuado, CTA "Confirmá el resultado" (llamada a la app, no a WhatsApp).

### Fase 4: flyer de resultado (winner-forward)

- **Pareja ganadora con protagonismo visual dominante**: tipografía más grande, color amarillo Padel Red, posición superior o central.
- **Score en tipografía gigante** (ej: "2-0", "2-1") como elemento gráfico principal.
- **Pareja perdedora en contraste atenuado**: gris, tipografía menor, posición inferior.
- **Trofeo 🏆 o corona 👑** junto a los ganadores.
- **Fecha y link en footer**, sin competir con el resultado.
- **Objetivo**: que al ver el flyer en WhatsApp quede inmediatamente claro quién ganó y por cuánto.

### Mensajes WhatsApp (CTA "Compartir en WhatsApp")

**Fase 1 (reclutamiento)**:
```
🎾 {cuposLibres} cupos libres
{fecha} - {club}

Sumate a este partido: https://padelred.app/m/{matchId}
```

**Fase 2 (armado)**:
```
🎾 {parejaA} vs {parejaB}
{fecha} - {club}

Hoy se define: https://padelred.app/m/{matchId}
```

**Fase 3 (esperando confirmación)**:
```
🎾 Resultado cargado: {parejaA} vs {parejaB}
{score}

Confirmá el resultado: https://padelred.app/m/{matchId}
```

**Fase 4 (resultado)**:
```
🏆 {parejaA} vs {parejaB}
{ganadora} ganó {score}

Ver partido: https://padelred.app/m/{matchId}
```

### Ubicación del CTA
- `/match/[matchId]/result` — post-carga, siempre visible.
- `/match/[matchId]` — ficha del partido, siempre visible (excepto fases 5 y 6).
- `/m/[matchId]` — vista pública, CTA visible solo si el viewer es jugador confirmado del match.

### Render condicional en `/m/[matchId]`
- Server Component que consulta `getMatchById(matchId)` + estado.
- Si `CONFIRMED` con score → vista resultado con flyer visible.
- Si `PENDING` → vista invitación actual sin regresión (el flyer OG se ve solo al compartir, no embebido en la página).
- Si `CANCELLED` → vista cancelado actual.

---

## Caso 2: Ranking (`/ranking`)

### Variante: per-user con habituales

El OG de `/ranking` es **personalizado al usuario que lo comparte**. Muestra al usuario **por encima de los 3 jugadores más habituales que estén por debajo de él** en el ranking.

- **"Habituales"**: los 3 jugadores con los que más partidos jugó (rival o pareja, según `playerEdges` — `matchesAsRivals + matchesAsPartners`), filtrados a los que están **abajo suyo** en el ranking score.
- **Objetivo viral**: que el usuario lo comparta en su grupo de WhatsApp con energía "te tengo de hijo" — dominancia sobre sus conocidos, no sobre el top global.
- **Por qué funciona**: es personal (hablás de gente que el receptor conoce), aspiracional (mostrás que estás arriba de tu grupo), y chicana pura (el receptor ve nombres reales y quiere responder).

### Layout

- **Usuario destacado**: nombre grande, posición en ranking, score, amarillo Padel Red.
- **3 habituales por debajo**: nombres menores, posición, score, en gris atenuado.
- **Flecha o indicador visual** mostrando que el usuario está arriba de ellos.
- **Header**: "Ranking Padel Red" + logo.
- **Footer**: link + CTA "¿Te animás a desafiarlo?" (CTA aspiracional para el receptor).

### Mensaje WhatsApp sugerido

```
🏆 Te tengo de hijo
{usuario} está arriba de {habitual1}, {habitual2}, {habitual3} en el ranking

Desafiálo: https://padelred.app/ranking
```

### Edge cases

- **Usuario no autenticado**: el OG de `/ranking` (ruta pública) no puede identificar al usuario. Renderiza un flyer genérico del top 3 global con CTA "Entrá y mirá tu posición".
- **Usuario último entre sus habituales**: si no tiene 3 habituales por debajo, muestra a los 3 habituales más cercanos arriba suyo con CTA "Estás escalando" (vuelta positiva).
- **Usuario nuevo sin habituales**: fallback al top 3 global genérico.
- **`/ranking` es pública pero el flyer per-user requiere sesión**: el `opengraph-image.tsx` usa `auth()` — si hay sesión, genera el flyer personal; si no, el genérico. El link compartido sigue siendo `/ranking` (no requiere auth para ver el top), pero el OG cambia según quién lo compartió.

### Limitación técnica

- **WhatsApp cachea el OG**: una vez que alguien comparte el link, WhatsApp guarda el preview. Si otro usuario comparte el mismo link `/ranking`, verá el OG del primero. **Mitigación**: para el flyer per-user, usar un link con query param `?u={userId}` que no afecta el render de la página pero sí el OG. Ej: `https://padelred.app/ranking?u={userId}`. El `opengraph-image.tsx` lee `searchParams.u` para identificar al usuario. Esto permite que cada usuario comparta "su" flyer sin colisión.

---

## Caso 3: Perfil público (`/p/[userId]`)

### Variante: stats del jugador + CTA "jugá conmigo"

El OG de `/p/[userId]` muestra al dueño del perfil con stats clave y un CTA invitacional.

- **Contenido**: nombre, alias, level, racha actual (wins consecutivas), wins totales.
- **Hook**: si el usuario tiene racha positiva, destacar "Racha de X partidos" como elemento principal. Si no, destacar level + wins.
- **CTA**: "Desafiá a {alias}" o "Sumate a jugar con {alias}".
- **Objetivo**: que el usuario comparta su perfil en WhatsApp para conseguir partidos (salvage indirecto) o para chicana.

### Mensaje WhatsApp sugerido

```
🎾 {alias} - Nivel {level}
Racha: {streak} partidos ganados

Desafiálo: https://padelred.app/p/{userId}
```

### Edge cases

- **Perfil sin partidos jugados**: flyer minimalista con nombre + level + CTA "Sumate a jugar conmigo".
- **Racha negativa**: no mostrar racha, destacar wins totales o level.

---

## Futuro (no incluido en esta spec)

- **H2H flyer**: `/p/[userId]?vs={otherUserId}` — tarjeta viral "X le ganó a Y N veces". Requiere UI para generar el link. Mismo patrón `opengraph-image.tsx`.
- **Turno flyer**: `/t/[id]` con flyer de reclutamiento de turno (mismo patrón que match fase 1).
- **Stats flyer**: "Jugué X partidos este mes" — resumen personal mensual compartible.

---

## Criterios de aceptación

### Transversal
1. Todos los `opengraph-image.tsx` usan `next/og` (`ImageResponse`) y edge runtime.
2. Todos los flyers tienen layout base 1200x630px con header Padel Red (logo + paleta amarilla) y footer con link + CTA.
3. Todos los flyers se renderizan en <1s en producción (cacheado en Vercel CDN).
4. Los flyers son legibles en thumbnail pequeño de WhatsApp (texto mínimo, contraste alto).
5. El branding es consistente entre todos los flyers (paleta, logo, tipografía).

### Match (`/m/[matchId]`)
6. `opengraph-image.tsx` en `src/app/m/[matchId]/` renderiza la fase correcta según estado del match.
7. CTA "Compartir en WhatsApp" visible en `/match/[matchId]/result` y `/match/[matchId]` (excepto fases 5 y 6).
8. El mensaje WhatsApp se adapta a la fase (reclutamiento, armado, esperando, resultado).
9. Al pasar de `PENDING` a `CONFIRMED`, el OG se regenera (`revalidateTag('match-og-{matchId}')` en `confirmMatchResult`).
10. Fase 4 (resultado) es winner-forward: ganadora dominante, score gigante, perdedora atenuada.

### Ranking (`/ranking`)
11. `opengraph-image.tsx` en `src/app/ranking/` genera flyer per-user si hay sesión, genérico si no.
12. Flyer per-user muestra al usuario arriba de sus 3 habituales por debajo en ranking.
13. Link compartible usa `?u={userId}` para evitar colisión de cache de WhatsApp entre usuarios.
14. Edge cases cubiertos: usuario último, usuario nuevo, sin sesión.

### Perfil (`/p/[userId]`)
15. `opengraph-image.tsx` en `src/app/p/[userId]/` muestra stats del jugador + CTA.
16. Racha positiva destacada; racha negativa oculta.
17. Edge case: perfil sin partidos → flyer minimalista.

---

## Notas técnicas

- **No requiere schema migration** — usa datos existentes de match, result, `playerEdges`, `playerGraphStats`, ranking.
- **No requiere FCM** — es share manual, no push.
- **Reusa queries existentes**: `getMatchById`, `getEnhancedUserMatches`, `getHeadToHeadStats`, `getCachedConfirmedMatches`, `playerEdges`.
- **`playerEdges` ya existe** para el grafo de jugadores — reusar para identificar habituales.
- **Ranking score**: usar el campo existente en `playerGraphStats.skillScore` o el cálculo de `src/lib/queries/ranking.ts`.

## Dependencias

- Ninguna bloqueante. Reusa queries y schema existentes.

## Owners

- **Agus** (primary match): `opengraph-image.tsx` de `/m/[matchId]`, variantes de las 4 fases, CTA en `/match/[id]/result` y `/match/[id]`, render condicional en `/m/[id]`, mensajes WhatsApp.
- **Tino** (primary ranking + OG infra): `opengraph-image.tsx` de `/ranking`, flyer per-user con habituales, componente compartido `flyer-layout.tsx`, caching strategy, `revalidateTag` wiring.
- **Roby** (primary perfil): `opengraph-image.tsx` de `/p/[userId]`, stats del jugador, racha, CTA invitacional.

## Flags de documentos raíz

- **MANUAL.md**: ⚠️ requiere actualización — nuevos flujos "Compartir partido" (4 fases), "Compartir ranking", "Compartir perfil". **Requiere consentimiento explícito del usuario antes de cambiar el flujo** (regla 13 AGENTS.md).
- **ADR.md**: recomendado — decisión sobre OG image generation con `next/og` + convención `opengraph-image.tsx` (patrón reutilizable, caching con `revalidateTag`, link con `?u=` para ranking per-user).
- **DESIGN.md**: recomendado — documentar el patrón de flyer (paleta, layout base, variantes por fase, winner-forward como principio). Es un asset visual con branding que se va a reusar.
- **AGENTS.md**: no requiere cambio — no altera scope de agentes.
