# PadelApp

PWA mobile-first para registrar partidos, organizar turnos abiertos y mantener rankings/reputación de jugadores de pádel.

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
| `/match/[matchId]/result` | Cargar resultado |
| `/m/[matchId]` | Invitación pública de partido |
| `/j/[playerId]` | Unirse a cupo directo |
| `/p/[userId]` | Perfil público de jugador |
| `/ranking` | Ranking global |
| `/notifications` | Acciones pendientes |
| `/catalog` | Catálogo de componentes |

## Base de datos local

1. Copia `.env.example` a `.env` y ajusta la `DATABASE_URL`.
2. Levanta la base con `npm run db:up`.
3. Ejecuta `npm run prisma:migrate` para crear las tablas.
4. Abre `npm run db:studio` para explorar datos.

## Documentación

- `DESIGN.md` — Política de diseño con máximas y ejemplos.
- `AGENTS.md` — Contexto y reglas para agentes/contribuyentes.
- `PRODUCT.md` — Visión del producto y principios de UX.
- `specs/` — Especificaciones de vistas y secciones.
