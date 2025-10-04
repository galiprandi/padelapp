# PadelApp – Esqueleto PWA

Esqueleto inicial mobile-first basado en Next.js 15, Tailwind CSS y componentes estilo shadcn con paleta amarilla. El objetivo es contar con una PWA instalable en cualquier dispositivo antes de integrar autenticación, base de datos o Firebase.

## Scripts

```bash
npm run dev             # arranca el servidor en modo desarrollo (http://localhost:3000)
npm run build           # genera el build de producción con soporte PWA
npm run start           # ejecuta el build en modo producción
npm run lint            # valida el código con las reglas base de Next.js
npm run db:up           # levanta Postgres local (docker compose)
npm run db:down         # detiene el contenedor de Postgres
npm run prisma:migrate  # aplica migraciones en la base definida en .env
npm run prisma:generate # regenera el cliente de Prisma tras cambios en el schema
npm run db:studio       # abre Prisma Studio
```

## Stack ya configurado

- **Next.js 15** (App Router, TypeScript estricto).
- **Tailwind CSS 3.4** + diseño inspirado en shadcn/ui con tokens amarillos.
- **React Query** inicializado (sin endpoints) para facilitar futuros datos remotos.
- **NextAuth.js** con Google OAuth y Prisma Adapter listo para usar credenciales reales.
- **next-pwa** con manifiesto, service worker y assets instalables.
- **Componentes UI** (`Button`, `Card`, `Badge`, `Tabs`, `Input`, `Textarea`, `Label`) listos en `src/components/ui`.
- **Navegación mobile** persistente para la app autenticada en `/(app)`.

## Pantallas maquetadas

- `/` Landing marketing con CTA para instalación.
- `/install` Guía rápida de instalación.
- `/(app)/dashboard` Resumen de reputación, turnos y últimos partidos.
- `/(app)/turnos` + `/(app)/turnos/nuevo` Listado y formulario de creación.
- `/(app)/ranking` Ranking individual y placeholder para parejas.
- `/(app)/registro` Formulario de registro de partido.
- `/t/[id]` Vista pública con datos mock del turno compartible.

## Base de datos local (PostgreSQL + Prisma)

1. Copia `.env.example` a `.env` y ajusta la `DATABASE_URL` si lo necesitas.
2. Levanta la base con `npm run db:up` (usa `docker compose` con Postgres 16).
3. Ejecuta `npm run prisma:migrate` o `npm run db:push` para crear las tablas de Auth (`User`, `Account`, `Session`, `VerificationToken`).
4. Abre `npm run db:studio` para explorar datos.

El cliente se expone desde `src/lib/prisma.ts` para reutilizar la conexión dentro del proyecto.

## Próximos pasos sugeridos

1. Conectar Prisma + Supabase para persistir turnos, partidos y ranking.
2. Afinar naming de alias/usuarios y permitir edición desde la app.
3. Activar Firebase Cloud Messaging utilizando el `firebase-messaging-sw.js` placeholder.
4. Añadir testing (Playwright/Vitest) para flujos críticos y CI en Vercel.

> La UI opera con datos mock definidos en `src/lib/mock-data.ts`. Sustitúyelos gradualmente a medida que se integren los servicios reales.
