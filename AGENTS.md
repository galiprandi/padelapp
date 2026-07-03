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
- **Ranking & Notifications Refinement**:
  - **Podium Section**: Nueva visualización premium con contenedor `backdrop-blur-2xl`, iluminación ambiental y sombras de alto impacto.
  - **Ranking List**: Estandarización a `rounded-[2rem]` y micro-typography `tracking-[0.2em]`.
  - **Notifications**: Implementación de Entrance Choreography (1000ms), ambient lighting y botones `rounded-2xl` de alto impacto.
  - **Notification Badge**: Refinamiento estético con `animate-ping` sutil y `shadow-lg shadow-primary/40`.
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

### ✅ Refactor de Invitaciones y Unirse Directo (V9+ High-Fidelity)
- **Estado**: Implementado
- **Funcionalidades**:
  - **Public Invitation Hero**: Nueva estética para invitaciones públicas (`/m/[id]`) con ambient lighting (`blur-[100px]`), cards `backdrop-blur-2xl` y tipografía V9 (`tracking-[0.2em]`).
  - **Frictionless Join Flow**: Rediseño de la vista de unirse a cupo directo (`/j/[id]`) con cards táctiles de alto impacto, jerarquía visual premium y botones de acción de 64px (`h-16`).
  - **Visual Sync**: Unificación estética entre el detalle de partido interno y la invitación pública para una experiencia de marca coherente.
  - **Tactile Feedback**: Implementación de animaciones de entrada (`duration-1000`) e estados `active:scale-[0.98]` en todos los puntos de contacto de invitación.
- **Archivos relacionados**:
  - `src/app/m/[matchId]/page.tsx`
  - `src/app/j/[playerId]/page.tsx`
### ✅ Elevación de Flujo de Partidos y Detalle Premium (V9+)
- **Estado**: Implementado
- **Funcionalidades**:
  - **Match Flow Elevation**: El flujo de creación de partidos (`/match/new`) ahora implementa iluminación ambiental (`blur-[100px]`), contenedores `backdrop-blur-2xl` y animaciones de entrada sincronizadas.
  - **MatchNavigation V9**: Estandarización de botones de navegación con altura `h-14`, `rounded-2xl`, sombras de alto impacto `primary/20` y feedback táctil `active:scale-[0.98]`.
  - **Premium Detail**: El detalle de partido (`/match/[matchId]`) refuerza la estética glassmorphic en la formación de equipos y notas del organizador.
  - **Micro-typography**: Unificación de etiquetas a `tracking-[0.2em]` y `font-black` para una jerarquía superior.
- **Archivos relacionados**:
  - `src/components/matches/step-content.tsx`
  - `src/components/matches/match-navigation.tsx`
  - `src/components/matches/slot-display.tsx`
  - `src/app/(app)/match/[matchId]/page.tsx`

### ✅ Creación de Partidos V9+ con Búsqueda Integrada
- **Estado**: Implementado
- **Funcionalidades**:
  - **Frictionless Search**: Integración de buscador de jugadores en `ManageSlotModal` que consulta `/api/players` con debounce de 300ms.
  - **High-Fidelity UI**: Elevación de los pasos de creación a estándares V9+ con `backdrop-blur-2xl`, `rounded-[2.5rem]` y animaciones sincronizadas.
  - **V9+ Slots**: Rediseño de `SlotDisplay` con avatares de 56px, badges de verificación y visualización premium del organizador ("Tú").
  - **Tactile Score Entry**: Refinamiento del paso de carga de marcador con feedback visual superior y cuadrículas táctiles optimizadas.
- **Archivos relacionados**:
  - `src/components/matches/manage-slot-modal.tsx`
  - `src/app/(app)/match/new/page.tsx`
  - `src/components/matches/step-content.tsx`
  - `src/components/matches/slot-display.tsx`
### ✅ Estandarización de UX e Inteligencia de Contexto (V9+)
- **Estado**: Implementado
- **Funcionalidades**:
  - **Universal Quick Join**: `TurnCard` habilita la acción de unirse en todas las vistas (Dashboard y Lista de Turnos) para minimizar el "Time to Participation".
  - **Match Time Intelligence**: `MatchResultCompact` prioriza la visualización de la hora para eventos del día actual, mejorando la relevancia contextual.
  - **Ranking UI Polish**: Unificación de micro-tipografía y badges de efectividad (Win Rate) en componentes de estatus competitivo.
- **Archivos relacionados**:
  - `src/components/turns/turn-card.tsx`
  - `src/components/matches/match-result-card.tsx`
  - `src/components/ranking/user-ranking-stats.tsx`
  - `src/app/p/[userId]/page.tsx`

### ✅ Elevación de Ranking y Reputación V9+ (High-Fidelity)
- **Estado**: Implementado
- **Funcionalidades**:
  - **Ranking Formula Refinement**: Implementación de bonos por sets ganados (+2 en victoria, +1 en derrota) y sistema de desempate multi-nivel (Score > Asistencia > Victorias > Fecha).
  - **Reputation Intelligence**: Introducción del `attendanceScore` basado en la ratio de confirmaciones sobre partidos totales, visualizado como porcentaje de reputación.
  - **V9 UI Polish**: Inclusión de indicadores de "Última actualización", badges de reputación con icono `ShieldCheck` y animaciones sincronizadas (`1000ms duration`).
  - **Visual Hierarchy**: Refinamiento de `UserRankingBanner` y `UserRankingCard` para integrar métricas de asistencia sin sobrecargar la interfaz.
- **Archivos relacionados**:
  - `src/app/(app)/ranking/actions.ts`
  - `src/app/(app)/ranking/page.tsx`
  - `src/components/ranking/user-ranking-stats.tsx`
### ✅ Refactor de Turnos y Creación High-Fidelity (V9+)
- **Estado**: Implementado
- **Funcionalidades**:
  - **TurnCard V9 Premium**: Evolución a `rounded-[2rem]`, `backdrop-blur-md` y universalización del "Quick Join" para todas las listas.
  - **Public Turn View Hero**: Nueva estética para `/t/[id]` con iluminación ambiental (`blur-[120px]`), cards `backdrop-blur-2xl` y visualización de cupos con bordes punteados sofisticados.
  - **Tactile Turn Creation**: Rediseño de `/turnos/nuevo` con el estándar de burbuja, selectores táctiles con feedback `active:scale-[0.96]` y botones de acción de 80px (`h-20`).
  - **V9 Metadata**: Unificación de micro-etiquetas con `tracking-[0.2em]` y `font-black` en todo el módulo de turnos.
- **Archivos relacionados**:
  - `src/components/turns/turn-card.tsx`
  - `src/app/(app)/turnos/page.tsx`
  - `src/app/(app)/turnos/nuevo/page.tsx`
  - `src/app/t/[id]/page.tsx`

### ✅ Elevación de Marketing y Onboarding (V9+ High-Fidelity)
- **Estado**: Implementado
- **Funcionalidades**:
  - **Landing Page Elevation**: Rediseño de la página de inicio (`/`) con iluminación ambiental (`blur-[100px]`), contenedores `backdrop-blur-2xl` y botones táctiles de 64px (`h-16`).
  - **Login Flow Polish**: La página de acceso (`/login`) adopta el estándar de alta fidelidad con micro-tipografía V9 (`tracking-[0.2em]`) y estética glassmorphic.
  - **Install Experience**: Refactor de la guía de instalación (`/install`) utilizando tarjetas de pasos `rounded-[1.5rem]` y jerarquía visual optimizada para PWA.
  - **Bubble Consistency**: Aplicación sistemática de `rounded-[2.5rem]` en contenedores principales de marketing para una primera impresión coherente.
- **Archivos relacionados**:
  - `src/app/page.tsx`
  - `src/app/login/page.tsx`
  - `src/app/install/page.tsx`

### ✅ Elevación de Invitaciones y Detalle de Partido (V9+ High-Fidelity)
- **Estado**: Implementado
- **Funcionalidades**:
  - **Internal Match Elevation**: Refactor de la vista interna de partido (`/match/[matchId]`) con iluminación ambiental de `blur-[120px]`, contenedores `rounded-[2.5rem]` y animaciones sincronizadas.
  - **Public Invitation Polish**: La vista pública de invitación (`/m/[matchId]`) adopta el estándar High-Fidelity con micro-tipografía V9 (`tracking-[0.2em]`) y jerarquía de metadatos superior.
  - **Direct Join Flow V9**: Elevación de la vista de unirse a cupo (`/j/[playerId]`) con tarjetas de equipo prominentes, botones táctiles de alto impacto y feedback visual mejorado.
  - **Typography Audit**: Estandarización global de micro-etiquetas al formato `text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50`.
- **Archivos relacionados**:
  - `src/app/(app)/match/[matchId]/page.tsx`
  - `src/app/m/[matchId]/page.tsx`
  - `src/app/j/[playerId]/page.tsx`

### ✅ Pulido de Interfaz y Consistencia Visual (V9+ High-Fidelity)
- **Estado**: Implementado
- **Funcionalidades**:
  - **Ranking Elevation**: Implementación de iconos de reputación `ShieldCheck` para jugadores con asistencia ejemplar (`attendanceScore >= 0.9`) e indicador de recencia de datos.
  - **Premium Match Detail**: Refinamiento de la vista de partido con iluminación ambiental ampliada, contenedores `backdrop-blur-2xl` y tipografía de confirmación mejorada.
  - **Typography Audit**: Estandarización global de micro-etiquetas y encabezados al formato `text-[11px] font-black uppercase tracking-[0.2em]`.
  - **Catalog Sync**: Actualización del catálogo de componentes para documentar los nuevos estándares de reputación y visualización.
- **Archivos relacionados**:
  - `src/app/(app)/ranking/page.tsx`
  - `src/app/(app)/match/[matchId]/page.tsx`
  - `src/app/(app)/me/page.tsx`
  - `src/app/(app)/match/page.tsx`
  - `src/app/catalog/page.tsx`

### ✅ Búsqueda Quirúrgica y Refactor de Ranking (V9+)
- **Estado**: Implementado
- **Funcionalidades**:
  - **Surgical Search**: Implementación de búsqueda quirúrgica y debounced en `/ranking` a través del componente `RankingSearch`, permitiendo filtrar jugadores por nombre o alias.
  - **Podium Intelligence**: El podio de honor se oculta automáticamente durante la búsqueda para priorizar la visibilidad de los resultados filtrados.
  - **RankingListItem Refactor**: Extracción de la lógica de ítems de lista a un componente dedicado, asegurando consistencia visual y mantenibilidad.
  - **UI Bugfix**: Corrección de bugs visuales en template literals dentro de componentes de estadísticas de ranking.
- **Archivos relacionados**:
  - `src/app/(app)/ranking/page.tsx`
  - `src/components/ranking/ranking-search.tsx`
  - `src/components/ranking/ranking-list-item.tsx`
  - `src/components/ranking/user-ranking-stats.tsx`
### ✅ Elevación de Flujo de Partidos V9+ Premium (Uma Edition)
- **Estado**: Implementado
- **Funcionalidades**:
  - **MatchNavigation Elevation**: Botones de navegación principal escalados a `h-16` con `rounded-[2rem]` y sombras `shadow-2xl shadow-primary/30`.
  - **ScoreSelector V9**: Rediseño táctico del selector de marcador con targets de `h-16`, escalado `1.1` y animaciones de entrada sincronizadas (`duration-1000`).
  - **Ambient Depth**: Ampliación de la iluminación ambiental a `blur-[120px]` y uso sistemático de contenedores `rounded-[3.5rem]` para los sets del marcador.
  - **Micro-typography V9**: Estandarización de todas las micro-etiquetas y headers de sección al formato `text-[11px] font-black uppercase tracking-[0.2em]`.
  - **ManageSlotModal Polish**: Refinamiento de la estética glassmorphic con `backdrop-blur-md` y animaciones de entrada `zoom-in-95 slide-in-from-bottom-8`.
- **Archivos relacionados**:
  - `src/components/matches/step-content.tsx`
  - `src/components/matches/match-navigation.tsx`
  - `src/components/matches/manage-slot-modal.tsx`

### ✅ Inteligencia Competitiva y Descubrimiento (Uma Edition)
- **Estado**: Implementado
- **Funcionalidades**:
  - **Head-to-Head (H2H) Intelligence**: Nueva sección en perfiles públicos (`/p/[userId]`) que detalla el historial compartido entre el espectador y el jugador (Socios vs Rivales) y el resultado del último duelo.
  - **Surgical Ranking Search**: Implementación de un buscador quirúrgico en la página de Ranking que permite localizar perfiles específicos mediante consultas debounced al servidor.
  - **V9+ H2H Styling**: Uso de contenedores glassmorphic, iluminación ambiental (`primary/10`) y micro-typography V9 (`tracking-[0.2em]`) para los insights competitivos.
- **Archivos relacionados**:
  - `src/app/p/[userId]/page.tsx`
  - `src/app/(app)/ranking/page.tsx`
  - `src/components/ranking/ranking-search.tsx`
  - `src/lib/match-queries.ts`
