# PadelApp – Esqueleto PWA

Esqueleto inicial mobile-first basado en Next.js 15, Tailwind CSS y componentes estilo shadcn con paleta amarilla. El objetivo es contar con una PWA instalable en cualquier dispositivo antes de integrar autenticación, base de datos o Firebase.

## Scripts

```bash
npm run dev      # arranca el servidor en modo desarrollo (http://localhost:3000)
npm run build    # genera el build de producción con soporte PWA
npm run start    # ejecuta el build en modo producción
npm run lint     # valida el código con las reglas base de Next.js
```

## Stack ya configurado

- **Next.js 15** (App Router, TypeScript estricto).
- **Tailwind CSS 3.4** + diseño inspirado en shadcn/ui con tokens amarillos.
- **React Query** inicializado (sin endpoints) para facilitar futuros datos remotos.
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

## Próximos pasos sugeridos

1. Integrar login con Google (NextAuth) y proteger rutas bajo `/(app)`.
2. Conectar Prisma + Supabase para persistir turnos, partidos y ranking.
3. Activar Firebase Cloud Messaging utilizando el `firebase-messaging-sw.js` placeholder.
4. Añadir testing (Playwright/Vitest) para flujos críticos y CI en Vercel.

> La UI opera con datos mock definidos en `src/lib/mock-data.ts`. Sustitúyelos gradualmente a medida que se integren los servicios reales.
