# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Organizador + jugador de pádel amateur** (rol dual). El organizador del club arma turnos fijos y recurrentes, los comparte por WhatsApp, y necesita llenar los cupos cuando alguien se baja. El mismo organizador también juega: usa la app para anotarse, confirmar asistencia y registrar resultados.

Situación de uso: en el club, a pie de pista, desde un smartphone. Coordinación por WhatsApp antes y durante el turno. Frición cero es obligatoria — el usuario está con las manos ocupadas o conversando, no quiere navegar menús.

Audiencia secundaria: jugadores invitados vía link que no son organizadores. Llegan por WhatsApp, se anotan con un toque, ven su perfil público y ranking.

## Product Purpose

Padel Red existe para **facilitar la organización de turnos fijos y recurrentes de pádel**, y **salvarlos cuando están en peligro de cancelación** por falta de jugadores.

El organizador crea el turno, lo comparte, y los jugadores se unen con un toque. Cuando faltan jugadores y el turno corre riesgo, Padel Red notifica automáticamente a la **red de contactos de pádel** de todos los anotados — jugadores con quienes compartieron cancha en el último año — para llenar los cupos antes de que sea tarde.

Éxito = cada turno fijo se juega. No = cantidad de features, ranking técnico, ni escala social. El indicador es **turnos salvados / turnos en riesgo**.

## Positioning

**Red social de pádel implícita, no una app de reservas ni un ELO.** El mecanismo que un competidor no podría copiar sin reconstruir desde cero: la red de contactos se construye automáticamente a partir de los partidos confirmados — no hay solicitudes de amistad, no hay seguidores. Cada cancha compartida fortalece la red, y esa misma red es la que después salva los turnos.

Distribución vía links de WhatsApp (sin App Store) + salvataje proactivo a la red de contactos = combinación que ningún competidor argentino de pádel ofrece hoy.

## Operating Context

- **Entorno**: club de pádel amateur, canchas compartidas, turnos fijos semanales o quincenales.
- **Dispositivo**: smartphone, uso a pie de pista. Mobile-first no es opcional.
- **Distribución**: links compartidos por WhatsApp. El link es la puerta de entrada — no hay App Store, no hay store listing.
- **Coordinación**: WhatsApp es el canal de coordinación hoy. Padel Red no reemplaza WhatsApp para invitar; lo complementa con inscripción estructurada y salvataje automático.
- **Login**: Google OAuth only. Sin contraseñas, sin email magic links.
- **Datos del partido**: el creador del partido marca asistencia (ATTENDED / LATE / NO_SHOW) post-partido. Al menos un jugador por equipo debe confirmar el resultado.
- **Ranking**: fórmula simple `score = 1000 + (wins * 15) + (streak * 5) + (setsWonBonus)` con decay temporal (x0.5 a 60 días, x0.25 a 120 días). No es ELO.

## Capabilities and Constraints

### Implementado (MVP actual)
- Google OAuth login (NextAuth).
- Creación de turnos con cupos, inscripción abierta hasta el inicio.
- Registro de partidos vinculado a turnos, con confirmación por equipo.
- Marcado de asistencia (ATTENDED / LATE / NO_SHOW) por el creador.
- Ranking individual con fórmula simple y decay temporal.
- Gestión de perfil con alias.
- PWA instalable con `<install>` element y fallback.
- Perfiles públicos de jugador, invitaciones a partidos, links de join directo.

### Pendiente (crítico para lanzamiento)
- **Firebase Cloud Messaging** (push notifications) — blocking. Owner: Roby.
- **Padel contact network** — derivada automáticamente de partidos confirmados. Owner: Coello (`src/lib/queries/contacts.ts`).
- **Player graph** — skill score interno desde partidos confirmados, reemplazando el `level` auto-reportado (1–8). Owner: Coello. El score interno nunca se muestra al usuario.
- **"Open to my network"** — notificar a contactos cuando un turno tiene cupos abiertos. Audiencia: contactos de **todos los inscriptos** (no solo organizador), de partidos confirmados en los **últimos 12 meses**, sin duplicados, excluyendo ya-inscriptos. Trigger: Bela (salvage flow), infra: Roby (FCM send).
- **Onboarding** para first-time users (empty state con CTA directo). Owner: Roby.

### Nice to Have (post-MVP)
- **Chat de Turnos** (`specs/turn-chat.md`): chat en tiempo real por turno con historial efímero (90 días TTL vía Redis) y bot del sistema que envía mensajes contextuales (bajas, cupos, recordatorios, resultados). Stack: Socket.io + Upstash Redis. El bot del sistema es el diferenciador vs WhatsApp. Owner: Bela.

### Lo que NO es Padel Red (hoy)
- No es un sistema de reservas de canchas (eso lo hace el club).
- No es un sistema de matchmaking automático (eso requiere escala).
- No es una red social general con feed y seguidores — pero evolucionará hacia una red social de pádel basada en la red de contactos implícita.
- No es un sistema técnico de medición de nivel (el ranking es un gancho, no un ELO serio).

### Visión de evolución: Red Social de Pádel
La red de contactos implícita —que hoy sirve para salvar turnos— es la base sobre la que se construirá la capa social. Transición incremental:

1. **Fase actual (MVP)**: organización de turnos + red de contactos implícita + salvataje.
2. **Fase siguiente**: visibilidad de tu red — ver con quién jugaste, frecuencia, compatibilidad de nivel.
3. **Fase social**: interacción entre jugadores — perfiles enriquecidos, historial compartido, reputación basada en asistencia y comportamiento.
4. **Fase comunidad**: feed de actividad del círculo de pádel, descubrimiento de jugadores, organización de juegos entre contactos.

Principio rector: **la red social emerge de los partidos jugados, no de conexiones manuales**. No habrá solicitudes de amistad ni seguidores.

## Brand Commitments

- **Nombre**: Padel Red.
- **Dominio**: `padelred.app`.
- **Paleta**: amarillo como color primario (vibrante, deportivo). Sin glassmorphism, sin ambient lighting, sin V9+ patterns. Ver `DESIGN.md`.
- **Voz**: cercana, deportiva, amateur. Español rioplatense. No técnico, no corporativo.
- **Distribución**: links de WhatsApp como puerta de entrada. Sin App Store.
- **Login**: Google OAuth only.

## Evidence on Hand

- **Grupo piloto en un club**: hay un club piloto usando la app con datos reales pero no públicos. Future work puede referenciarlo internamente; no debe fabricar testimonials ni métricas públicas.
- **Caso de uso real del owner**: los owners (Coello/Roby/Bela) tienen sus propios turnos de pádel como caso de uso real y referencia de diseño.
- **Specs en `specs/`**: especificaciones de features pendientes y nice-to-have (ej. `specs/turn-chat.md`).
- **Ausencias que future work no debe fabricar**: no hay testimonials públicos, no hay métricas de usuarios, no hay casos de estudio. Cualquier claim público debe esperar a evidencia real.

## Product Principles

1. **Salvar turnos es el valor central.** Si una decisión no ayuda a que un turno fijo se juegue, está fuera de scope del MVP. El ranking es secundario.
2. **La red emerge de la cancha, no de conexiones manuales.** Cada partido confirmado construye la red. No hay solicitudes de amistad, no hay seguidores. La relación social se deriva de los partidos jugados.
3. **Cero fricción o no funciona.** Google login, links compartibles, inscripción con un toque. El usuario está en el club, con las manos ocupadas — cada paso extra es un turno que se cancela.
4. **Mobile-first o nada.** Diseñar para smartphone a pie de pista antes que desktop. PWA instalable, no App Store.
5. **El ranking es un gancho, no un ELO.** Simple, motivacional, arenga competitiva. El score interno derivado del grafo nunca se muestra al usuario — el ranking es la única señal competitiva visible.

## Accessibility & Inclusion

Mobile-first PWA pública. Sin estándar WCAG formal comprometido aún, pero la app sigue las reglas de `DESIGN.md`: sin micro-typografía por debajo de 11px, sin `font-black`, contraste sólido (no semi-transparente), `aria-label` en español para forma reciente y acciones. Accesibilidad con pulgar (CTAs de ancho completo, alturas estándar h-12/h-10).
