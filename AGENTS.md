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
8. Mantener las especificaciones de vistas o secciones en la carpeta `specs/` con su estado (Not Implemented / Implemented) y desarrollar exactamente lo defined allí.
9. Consultar y actualizar el catálogo de componentes (`/app/(app)/component-catalog`) cada vez que se diseñe o refactorice un componente reusable: extraerlo a `/components`, documentar su uso en el catálogo e incorporar cualquier nueva variante para que funcione como guía de diseño viva.
10. Priorizar Server Components y Server Actions siempre que sea posible; recurrir a Client Components solo cuando el interactividad del navegador lo exija.

## 6. Próximos pasos generales
1. Crear esqueleto Next.js 15 con Tailwind + shadcn (tema amarillo) y configuración PWA básica.
2. Maquetar pantallas mock: dashboard, detalle de turno, alta de turno, ranking, registro de partido.
3. Integrar placeholders para futuros módulos (auth Google, Prisma/Supabase, FCM) sin bloquear el build.
4. Establecer linting, formatos y scripts de build/deploy.

## 6.1. Estado actual del desarrollo

### ✅ Refinamiento Estético y Dashboard (Mi Agenda)
- **Estado**: Implementado
- **Funcionalidades**:
  - Unificación de próximos turnos y partidos en la sección "Mi Agenda" con orden cronológico basado en el campo `date`.
  - Refactor del componente `EmptyState` con bordes sólidos, `bg-card/50`, padding optimizado e iconos en círculos `bg-primary/5`.
  - Pulido de `MatchResultCard` con celdas de puntuación cuadradas perfectas y jerarquía de ganadores mejorada.
  - Ajuste de jerarquía visual en Dashboard con `gap-12` y descripciones de cabecera más concisas.
  - `TurnCard` ahora muestra el estado de inscripción del usuario ("Inscripto").

### ✅ Refactor de Perfil y Dashboard de Alta Fidelidad (V9+)
- **Estado**: Implementado
- **Funcionalidades**:
  - **Hero Section**: Nueva visualización premium del perfil con ambient lighting (`blur-[100px]`) y cards `backdrop-blur-2xl`.
  - **Tactile Forms**: Rediseño de `ProfileForm` con selectores táctiles V9, feedback `active:scale-[0.98]` y botones de acción de alto impacto (`h-16`).
  - **Dashboard Polish**: Estandarización de botones de navegación secundaria y sincronización de Entrance Choreography (1000ms duration).
  - **Metadata V9**: Unificación de tipografía de micro-etiquetas con `tracking-[0.2em]`.
- **Archivos relacionados**:
  - `src/app/(app)/me/profile/page.tsx`
  - `src/app/(app)/me/profile/profile-form.tsx`
  - `src/app/(app)/me/page.tsx`
  - `src/app/catalog/page.tsx`

### ✅ Dashboard Inteligente y Gestión de Acciones
- **Estado**: Implementado
- **Funcionalidades**:
  - Nueva sección "Acciones pendientes" que prioriza confirmaciones y carga de resultados pasados.
  - Los partidos PENDING con score cargado se priorizan (confirmación) sobre los que no tienen (carga).
  - La sección "Mi Agenda" se reserva estrictamente para turnos y partidos futuros (planificación).
  - Contador visual de acciones pendientes en el encabezado de sección.
  - Orden cronológico inverso para acciones (lo más reciente arriba) y directo para agenda (lo próximo arriba).
- **Archivos relacionados**:
  - `src/app/(app)/me/page.tsx`

### ✅ Career Intelligence y Resumen de Carrera (V9+)
- **Estado**: Implementado
- **Funcionalidades**:
  - Incorporación de tarjeta "Resumen de Carrera" en el historial de partidos (`/match`) con métricas de Win Rate, Racha y Mejor Socio.
  - Visualización de "Forma Reciente" (W/L dots) en el Dashboard para feedback inmediato.
  - Estandarización de `EmptyState` y `MatchResultCompact` con el estándar de alta fidelidad V9+.
- **Archivos relacionados**:
  - `src/app/(app)/match/page.tsx`
  - `src/app/(app)/me/page.tsx`
  - `src/components/matches/match-result-card.tsx`
