# Padel Red

PWA mobile-first para **organizar turnos fijos de pádel y salvarlos cuando faltan jugadores**. El organizador crea el turno, lo comparte, y los jugadores se unen con un toque. Si el turno corre riesgo de cancelación, la app notifica automáticamente a la red de contactos de pádel del organizador. Incluye un ranking simple como gancho de engagement competitivo.

## Scripts

```bash
pnpm dev             # servidor de desarrollo (http://localhost:3000)
pnpm build           # build de producción
pnpm start           # ejecutar build de producción
pnpm lint            # lint
pnpm db:up           # levantar Postgres local (docker compose)
pnpm db:down         # detener Postgres
pnpm db:drop         # eliminar todas las tablas
pnpm db:generate     # generar migración Drizzle
pnpm db:migrate      # aplicar migraciones Drizzle
pnpm db:push         # push schema a DB (dev rápido)
pnpm db:studio       # abrir Drizzle Studio
```

## Stack

- **Next.js 16** (App Router, TypeScript, Server Components/Actions, Cache Components).
- **Tailwind CSS** + shadcn/ui con paleta amarilla.
- **Drizzle ORM + PostgreSQL** (local via Docker, producción via Neon serverless).
- **NextAuth.js** con Google OAuth y `@auth/drizzle-adapter`.
- **PWA** instalable con service worker y manifest.
- **Firebase Cloud Messaging** (pendiente — bloqueante para lanzamiento).
- **Socket.io + Upstash Redis** (pendiente — Chat de Turnos, post-MVP).

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Landing page |
| `/login` | Login con Google |
| `/install` | Guía de instalación PWA |
| `/me` | Dashboard con agenda y acciones |
| `/me/profile` | Perfil y alias de juego |
| `/turnos` | Lista de turnos abiertos |
| `/turnos/nuevo` | Crear turno |
| `/turnos/[id]/editar` | Editar turno |
| `/t/[id]` | Vista pública de turno |
| `/match` | Historial de partidos |
| `/match/new` | Crear partido |
| `/match/[matchId]` | Detalle de partido |
| `/match/[matchId]/edit` | Editar partido |
| `/match/[matchId]/result` | Cargar resultado y asistencia |
| `/m/[matchId]` | Invitación pública de partido |
| `/j/[playerId]` | Unirse a cupo directo |
| `/p/[userId]` | Perfil público de jugador |
| `/ranking` | Ranking global (gancho competitivo) |
| `/notifications` | Acciones pendientes |
| `/catalog` | Catálogo de componentes (dev) |

## Base de datos local

1. Copia `.env.example` a `.env` y ajusta la `DATABASE_URL`.
2. Levanta la base con `pnpm db:up`.
3. Ejecuta `pnpm db:migrate` para crear las tablas.
4. Abre `pnpm db:studio` para explorar datos.

## Documentación

- `PRODUCT.md` — Visión del producto, misión y principios de UX.
- `MANUAL.md` — Manual de usuario y fuente de verdad de todos los flujos de la app. Listo para inyectar en chatbot.
- `padelred-product-brief.md` — Brief completo del producto y roadmap.
- `DESIGN.md` — Política de diseño con máximas y ejemplos.
- `AGENTS.md` — Contexto y reglas para agentes/contribuyentes.
- `specs/` — Especificaciones de vistas y secciones.
