# Padel Red

PWA mobile-first para **organizar turnos fijos de pádel y salvarlos cuando faltan jugadores**. El organizador crea el turno, lo comparte, y los jugadores se unen con un toque. Si el turno corre riesgo de cancelación, la app notifica automáticamente a la red de contactos de pádel del organizador. Incluye un ranking simple como gancho de engagement competitivo.

## Scripts

```bash
npm run dev             # servidor de desarrollo (http://localhost:3000)
npm run build           # build de producción
npm run start           # ejecutar build de producción
npm run lint            # lint
npm run db:up           # levantar Postgres local (docker compose)
npm run db:down         # detener Postgres
npm run db:drop         # eliminar todas las tablas
npm run prisma:migrate  # aplicar migraciones
npm run prisma:generate # regenerar cliente Prisma
npm run db:studio       # abrir Prisma Studio
```

## Stack

- **Next.js 15** (App Router, TypeScript, Server Components/Actions).
- **Tailwind CSS** + shadcn/ui con paleta amarilla.
- **Prisma + PostgreSQL** (local via Docker, producción via Supabase).
- **NextAuth.js** con Google OAuth y Prisma Adapter.
- **PWA** instalable con service worker y manifest.
- **Firebase Cloud Messaging** (pendiente — bloqueante para lanzamiento).

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Landing page |
| `/login` | Login con Google |
| `/install` | Guía de instalación PWA |
| `/me` | Dashboard con agenda y acciones |
| `/me/profile` | Perfil y nivel de juego |
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
2. Levanta la base con `npm run db:up`.
3. Ejecuta `npm run prisma:migrate` para crear las tablas.
4. Abre `npm run db:studio` para explorar datos.

## Documentación

- `PRODUCT.md` — Visión del producto, misión y principios de UX.
- `MANUAL.md` — Manual de usuario y fuente de verdad de todos los flujos de la app. Listo para inyectar en chatbot.
- `padelred-product-brief.md` — Brief completo del producto y roadmap.
- `DESIGN.md` — Política de diseño con máximas y ejemplos.
- `AGENTS.md` — Contexto y reglas para agentes/contribuyentes.
- `specs/` — Especificaciones de vistas y secciones.
