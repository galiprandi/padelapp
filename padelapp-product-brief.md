# PadelApp

**La app para organizar turnos fijos de pádel, salvarlos cuando faltan jugadores, y mantener un ranking como gancho competitivo.**

---

## Visión General

PadelApp es una **Progressive Web App (PWA)** diseñada para jugadores de pádel que organizan turnos fijos y recurrentes. El problema real que resuelve:

> _"Tengo un turno fijo los martes 20h. Faltan 2 horas y tengo 2 jugadores. Necesito llenar los cupos con gente que ya jugó conmigo, sin armar 10 grupos de WhatsApp."_

### Misión

Facilitar la organización de turnos fijos y recurrentes, y **salvarlos en caso de peligro de cancelación** por falta de jugadores.

### Cómo funciona

1. **El organizador crea el turno** y lo comparte con un link.
2. **Los jugadores se unen** con un toque (login con Google).
3. **Si faltan jugadores y el turno corre riesgo**, PadelApp notifica automáticamente a la **red de contactos de pádel** del organizador — jugadores con quienes compartió cancha alguna vez.
4. **Los contactos reciben una push** y pueden sumarse con un toque.

### El ranking como gancho

El ranking **no es el valor central**. Es un gancho de engagement y arenga competitiva para motivar el registro de resultados y el retorno a la app. Es intencionalmente simple y no pretende ser un sistema técnico de medición de nivel.

### Red social implícita

Cada partido confirmado construye automáticamente tu red de contactos de pádel. No hay que agregar amigos ni enviar solicitudes. Jugaste con alguien una vez → ya es parte de tu red. Esta red es la base del sistema de salvataje de turnos.

---

## MVP (Versión 1)

### Funcionalidades implementadas

#### 1. Login con Google
- Únicamente Google OAuth (sin contraseñas, sin magic links).
- Se extraen: email, nombre, foto.
- Alias editable post-registro.

#### 2. Creación de turnos abiertos
- Club, fecha/hora, duración, máximo de jugadores, nivel sugerido.
- Link público compartible: `padelapp.app/t/abc123`.

#### 3. Inscripción abierta
- Cualquiera con el link puede anotarse hasta el inicio del turno.
- Lista de inscritos visible.
- El turno se cierra al completar cupo o al iniciar el horario.

#### 4. Registro de partidos
- Partido vinculado al turno o independiente.
- Formato: amistoso o torneo local, 1/3/5 sets.
- Resultado set por set.
- Confirmación de resultado por ambos equipos.
- Sistema de asistencia (ATTENDED / LATE / NO_SHOW).

#### 5. Ranking (gancho competitivo)
- Ranking individual con fórmula simple.
- Decay temporal (x0.5 a 60 días, x0.25 a 120 días).
- Tiebreak: Score > Asistencia > Victorias > Recencia.
- **No es un sistema ELO serio** — es arenga, no medición técnica.

#### 6. Sistema de asistencia y reputación
- El creador marca asistencia post-partido.
- Penalización por no-show y tardanzas.
- Impacta en el ranking y en el attendance score.

#### 7. PWA instalable
- Instalable en iOS y Android.
- Elemento `<install>` experimental con fallback.
- Manifest y service worker configurados.

### Funcionalidades pendientes (críticas para lanzamiento)

#### 8. Notificaciones push (Firebase Cloud Messaging)
- **Bloqueante para el valor real del producto.**
- Eventos: turno abierto en tu red, te sumaste a un turno, turno completo, recordatorio 2h antes, resultado pendiente.

#### 9. Red de contactos de pádel
- Derivada automáticamente de partidos confirmados.
- Query: "con quién jugaste antes".
- Base del sistema de salvataje de turnos.

#### 10. "Abrir turno a mi red"
- Botón en turno con cupos libres.
- Notifica a la red de contactos de **todos los inscriptos** en el turno (no solo el organizador).
- Solo contactos de partidos confirmados en los **últimos 12 meses** (excluye relaciones antiguas donde la evolución de nivel puede diferir mucho).
- Sin duplicados: si un jugador es contacto de 2 inscriptos, recibe 1 sola push.
- Excluye a los ya inscriptos en el turno.
- 1 toque para unirse desde la push.

---

## Stack Técnico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Next.js 15 (App Router, Server Components, Server Actions) |
| **Lenguaje** | TypeScript |
| **Estilado** | Tailwind CSS + shadcn/ui |
| **Base de datos** | PostgreSQL (local via Docker, producción via Supabase) |
| **ORM** | Prisma |
| **Autenticación** | NextAuth.js (Google OAuth) |
| **PWA** | Manifest + Service Worker |
| **Notificaciones Push** | Firebase Cloud Messaging (pendiente) |
| **Hosting** | Vercel |

---

## Roadmap

### Etapa 1 — Valor core (bloqueante para lanzamiento)
- Firebase Cloud Messaging (push notifications).
- Red de contactos automática.
- "Abrir a mi red" desde turno con cupos libres.
- Onboarding de primer turno.

### Etapa 2 — Engagement
- Recordatorio automático 2h antes del turno.
- Compartir resultado en WhatsApp (og:image dinámico).
- Mínimo de partidos para aparecer en ranking público.

### Etapa 3 — Retención
- Sistema de asistencia (implementado, pendiente de uso real).
- Reputación visible en perfil público.
- Perfil público mejorado.

### Etapa 4 — Escala (post-validación)
- Matchmaking por nivel.
- Integración con clubes (reserva de canchas).
- Estadísticas avanzadas.

---

## Lo que NO es PadelApp

- No es un sistema de reservas de canchas.
- No es un sistema de matchmaking automático (requiere escala).
- No es una red social general (no hay feed, no hay seguidores).
- No es un sistema técnico de medición de nivel (el ranking es un gancho).

---

## Pitch de 30 segundos

> _"¿Organizás turnos fijos de pádel y se te cancelan por falta de jugadores? PadelApp los salva. Creás el turno, compartís el link, y si faltan jugadores la app avisa automáticamente a tu red de contactos de pádel. Además, un ranking simple te da excusa para registrar resultados y competir con tu grupo. Sin fricción. Solo pádel."_
