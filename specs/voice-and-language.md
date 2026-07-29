# Voz y Lenguaje Ubicuo

Define cómo se comunica Padel Red con el usuario en todos los canales: UI, push notifications, WhatsApp (share text) y calendario. Es la fuente de verdad para `clarify` y cualquier cambio de copy.

## 1. Lenguaje ubicuo

| Concepto | Término | NO usar |
|---|---|---|
| Evento agendable que crea el organizador | **Turno** | "Partido" (salvo contexto explícito de resultado) |
| Lo que se juega dentro del turno | **Partido** | "Match", "Juego" |
| Acción de anotarse en un turno | **Sumarse** | "Anotarse", "Unirse", "Join" |
| Acción de salir de un turno | **Bajarse** | "Salir", "Leave", "Removerse" |
| Cupo disponible | **Cupo libre** | "Cupo abierto" (reservado para "abrir a la red") |
| Acción de notificar a la red | **Abrir a la red** | "Notificar contactos", "Salvage" |
| Jugador en lista de espera | **Suplente** | "Waitlist", "Reserva" |
| Jugador que crea el turno | **Organizador** | "Owner", "Creador" |
| Red de contactos de pádel | **Red** | "Contactos", "Network", "Amigos" |
| Resultado del partido | **Marcador** | "Score", "Resultado" (en UI; "resultado" ok en body) |
| Acción de cargar marcador | **Cargar resultado** | "Registrar score", "Submit result" |
| Acción de confirmar marcador | **Confirmar** | "Validar", "Aprobar" |
| Asistencia: presente | **Presente** | "ATTENDED" |
| Asistencia: tarde | **Llegó tarde** | "LATE" |
| Asistencia: ausente | **No asistió** | "NO_SHOW", "Ausente" (en UI: "No asistió") |

## 2. Tono

- **Voz:** cercana, deportiva, amateur. Español rioplatense. No técnico, no corporativo.
- **Persona:** siempre **vos**. "Te sumaste", "Sos el organizador", "Te bajaste".
- **Tercera persona** para acciones de otros: "Juan se sumó", "María se bajó".
- **Pasivo impersonal prohibido:** no "Fuiste removido", "Te asignaron un cupo", "Te marcaron ausente". Reformular en activo: "El organizador te sacó del turno", "Tenés un cupo en...", "El organizador marcó que no asististe".
- **Exclamaciones (`¡...!`):** nunca. Tono plano, deportivo, confiado. La urgencia la da el verbo y el contexto, no los signos.
- **Emojis:** no en mensajes del sistema (push, WhatsApp, calendar). Solo en UI si el usuario los pide.
- **Mayúsculas:** solo al inicio y en nombres propios. No "TURNO COMPLETO", no "Cupo Libre".

## 3. Jerarquía del mensaje (por estado)

Para cada push/aviso, decidir:
1. **El hecho** (qué pasó) — 1 línea, verbo en pasado.
2. **La acción** (qué puede hacer el usuario) — solo si hay acción.
3. **Contexto** (cuándo/dónde) — solo si cambia la decisión.

### Ejemplos canónicos (push)

| Estado | Title | Body |
|---|---|---|
| Turno completo | `Turno completo: Italia · 19hs` | `Los 4 cupos están cubiertos. Nos vemos en la cancha.` |
| Jugador se sumó | `Juan se sumó a Italia · 19hs` | `3/4 jugadores. Falta uno.` |
| Jugador se bajó | `María se bajó de Italia · 19hs` | `Quedó un cupo libre. Sumate o abrí a la red.` |
| Cupo libre (suplentes) | `Cupo libre en Italia · 19hs` | `En 2h. Ocupá el cupo si podés.` |
| Baja tardía | `Baja tardía en Italia · 19hs` | `Te bajaste a menos de 2h. Perdiste 5% de reputación.` |
| Nuevo organizador | `Sos el organizador de Italia · 19hs` | `El anterior se bajó. Podés editar o cancelar el turno.` |
| Partido iniciado | `El partido empezó: Italia · 19hs` | `Cargá el marcador cuando termine.` |
| Turno cancelado | `Turno cancelado: Italia · 19hs` | `El organizador canceló el turno.` |
| Abrir a la red | `Cupo abierto en tu red: Italia · 19hs` | `Falta un jugador. Si podés, sumate.` |
| Resultado cargado | `Resultado cargado por Juan` | `Confirmá el marcador: 6-4 6-3.` |
| No asistió | `El organizador marcó que no asististe` | `En Italia · 19hs. Perdiste 25 puntos de ranking.` |
| Suplente removido por organizer | `El organizador te sacó de Italia · 19hs` | `Ya no sos suplente.` |
| Cupo asignado por organizer | `Tenés un cupo en Italia · 19hs` | `El organizador te asignó.` |

## 4. WhatsApp (share text)

- **Turno:** `Turno de pádel en Italia hoy 19hs` (sin "disponible" — el link ya lo dice)
- **Invitación a partido:** `Partido de pádel en Italia hoy 19hs`
- **Resultado:** `Mirá el marcador de nuestro partido: 6-4 6-3` (link abajo)

> Cambio vs estado anterior: saco "disponible" (redundante con el link), unifico "marcador" en vez de "resultado" para consistencia con UI.

## 5. Calendar

- **Title:** `Pádel · Italia · 19hs` (coincide con `getTurnLabel`)
- **Details (Google):** `Turno de pádel en Italia. Confirmá asistencia: ${url}`
- **Details (ICS):** `Turno de pádel en Italia. Ver más: ${url}`
- **Location:** `Italia`

> Cambio vs estado anterior: "Partido de Pádel - Club" → "Pádel · Club · hora". "¡No te olvides..." → "Turno de pádel en...".

## 6. UI copy (reglas generales)

- **Botones:** verbo + objeto. "Sumarme", "Bajarme", "Cancelar turno", "Abrir a la red", "Cargar resultado", "Confirmar".
- **Empty states:** 1 línea de estado + 1 CTA. "No tenés turnos activos. Creá el primero."
- **Errores:** qué falló + cómo recuperarse. "No se pudo sumar. El turno está lleno."
- **Toasts:** pasado, breve. "Te sumaste al turno.", "Te bajaste del turno."
- **Loading:** operación real. "Cargando turnos...", "Guardando perfil..."

## 7. Mantenimiento

Este doc es la fuente de verdad. Cualquier cambio de copy debe actualizar primero este doc y luego el código. `clarify` lo usa como referencia para auditar consistencia.
