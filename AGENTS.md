# 🤖 AGENTS – PadelApp

Este documento define el contexto y las responsabilidades para agentes automatizados o contribuyentes que colaboren en la creación del MVP descrito en `padelapp-product-brief.md`.

## 1. Propósito del proyecto
- Construir **PadelApp**, una PWA mobile-first para registrar partidos, organizar turnos abiertos y mantener rankings/reputación de jugadores de pádel.
- Enfocada en MVP con fricción mínima: login exclusivo con Google, registro simple de turnos y partidos, ranking dinámico por nivel y reputación.

## 2. Principios clave
- **Mobile-first**: toda pantalla se diseña para uso en smartphones antes de desktop.
- **Experiencia sin fricción**: flujos cortos, datos mínimos, acciones claras.
- **Distribución vía links**: cada turno o partido genera URLs compartibles que permiten acceso inmediato tras login Google.
- **Transparencia competitiva**: ranking y reputación visibles, con categorías estándar (1 profesional – 8 principiante).

## 3. Alcance actual (MVP)
- Registro/login exclusivo con Google (NextAuth).
- Creación de turnos abiertos con cupos y nivel sugerido.
- Inscripción abierta hasta el inicio del turno.
- Registro de partidos vinculados al turno, con confirmación de los cuatro jugadores.
- Rankings individual y por pareja; reputación basada en asistencia.
- PWA instalable con notificaciones push (Firebase) en roadmap corto.

## 4. Stack técnico objetivo
- **Frontend**: Next.js 15 (App Router, TypeScript, Server Components/Actions).
- **UI**: Tailwind CSS + shadcn/ui (tema amarillo).
- **Datos**: React Query en cliente, Prisma + Supabase (PostgreSQL) en servidor.
- **Autenticación**: NextAuth con Google OAuth.
- **Infraestructura**: Vercel para hosting, dominio `padelapp.app`.
- **Notificaciones**: Firebase Cloud Messaging (posterior a MVP inicial).

## 5. Reglas para agentes
1. Mantener consistencia con la visión de MVP; posponer funcionalidades fuera de alcance (matchmaking, red social, etc.).
2. Priorizar generación de un esqueleto de app PWA instalable; auth/DB/Firebase se integrarán en fases subsiguientes.
3. Adoptar componentes y estilos de shadcn/ui con paleta amarilla personalizada.
4. Documentar supuestos y decisiones en `README.md` o archivos específicos según la funcionalidad.
5. Validar que cualquier flujo crítico funcione en mobile y soporte instalación como PWA.
6. Mantener el código, comentarios y URLs escritos en inglés.
7. Preferir formularios estándar del sistema en mobile para que iOS o Android adapten la interfaz, priorizando la usabilidad por sobre el diseño visual.
8. Mantener las especificaciones de vistas o secciones en la carpeta `specs/` con su estado (Not Implemented / Implemented) y desarrollar exactamente lo definido allí.

## 6. Próximos pasos generales
1. Crear esqueleto Next.js 15 con Tailwind + shadcn (tema amarillo) y configuración PWA básica.
2. Maquetar pantallas mock: dashboard, detalle de turno, alta de turno, ranking, registro de partido.
3. Integrar placeholders para futuros módulos (auth Google, Prisma/Supabase, FCM) sin bloquear el build.
4. Establecer linting, formatos y scripts de build/deploy.

## 7. Referencias
- Documento de requisitos: `padelapp-product-brief.md`.
- Repositorio: `github.com/galiprandi/padelapp`.
- Dominio objetivo: `padelapp.app`.
