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
9. Consultar y actualizar el catálogo de componentes (`/app/(app)/component-catalog`) cada vez que se diseñe o refactorice un componente reusable: extraerlo a `/components`, documentar su uso en el catálogo e incorporar cualquier nueva variante para que funcione como guía de diseño viva.
10. Priorizar Server Components y Server Actions siempre que sea posible; recurrir a Client Components solo cuando el interactividad del navegador lo exija.

## 6. Próximos pasos generales
1. Crear esqueleto Next.js 15 con Tailwind + shadcn (tema amarillo) y configuración PWA básica.
2. Maquetar pantallas mock: dashboard, detalle de turno, alta de turno, ranking, registro de partido.
3. Integrar placeholders para futuros módulos (auth Google, Prisma/Supabase, FCM) sin bloquear el build.
4. Establecer linting, formatos y scripts de build/deploy.

## 6.1. Estado actual del desarrollo
### ✅ Página de resultados de partidos (`/match/[matchId]/result`)
- **Estado**: Implementada y funcional
- **Funcionalidades**:
  - Visualización de parejas participantes con avatares
  - Formulario de ingreso de resultados por set (hasta 3 sets)
  - Validación y normalización de datos de scores existentes
  - Botón CTA de ancho completo según reglas mobile-first
  - Estados: partido abierto (permite editar) vs cerrado (solo lectura)
- **Errores corregidos**: Indexación de arrays, manejo de scores existentes, compatibilidad Next.js 15
- **Archivos relacionados**: 
  - `src/app/(app)/match/[matchId]/result/page.tsx`
  - `src/app/(app)/match/actions.ts` (saveMatchResultAction)
- **Pendiente**: Integración con autenticación y base de datos

### 🗑️ Limpieza de código
- **Estado**: Completado
- Eliminado componente no usado: `match-result-input.tsx` (2.3KB ahorrados)
- Build optimizado sin dependencias rotas

### ✅ Mejora UX en Gestión de Partidos
- **Estado**: Implementado
- **Funcionalidades**:
  - Invitación directa por slot via `/j/[playerId]`.
  - Botón "Liberar" para que el organizador pueda reabrir cupos ocupados.
  - Bloqueo de edición de nombres para jugadores ya unidos.
  - Banner de ranking personalizado para el usuario actual.
- **Archivos relacionados**:
  - `src/components/matches/match-players-manager.tsx`
  - `src/components/matches/manage-slot-modal.tsx`
  - `src/app/(app)/ranking/page.tsx`

### ✅ Pulido de UI y Estandarización de Empty States
- **Estado**: Implementado
- **Funcionalidades**:
  - Refinamiento del componente `EmptyState` con estética "bubble" (`rounded-3xl`, backdrop blur).
  - Estandarización de estados vacíos en Dashboard y Ranking.
  - Actualización de `PlayerCards` y contenedores de pareja para mayor consistencia visual.
  - Creación de `DESIGN.md` para documentar estándares visuales.
- **Archivos relacionados**:
  - `src/components/empty-state.tsx`
  - `src/components/players/player-cards.tsx`
  - `src/app/(app)/me/page.tsx`
  - `src/app/(app)/ranking/page.tsx`

## 7. Guía de diseño para nuevas vistas
- **Mobile-first**: estructurar cada paso o sección para ocupar el alto disponible (`100dvh` ajustado por safe areas), priorizando columnas simples y CTA de ancho completo en móviles.
- **Jerarquía clara**: encabezados `text-2xl font-bold` para títulos, subtítulos `text-sm font-semibold text-muted-foreground` para agrupar bloques (p.ej. Pareja A/B), y párrafos auxiliares `text-sm text-muted-foreground` para instrucciones.
- **Tarjetas interactivas**: usar contenedores con bordes redondeados, estados hover/active/focus visibles y accesibles (`focus-visible:ring`), replicando el patrón de selección de jugadores.
- **Acciones primarias/secundarias**: botón principal lleno arriba, seguido por acciones secundarias variante `ghost` u `outline`; mantener mínimo 44px de alto y full width en mobile.
- **Accesibilidad y estados**: definir `aria-label`, `aria-current` o roles según corresponda, asegurar contraste ≥4.5:1, y contemplar validaciones visuales claras antes de avanzar.
- **Iconografía y microcopy**: iconos de `lucide-react`, etiquetas cortas en español y mensajes directos tipo “Tocá el botón…”. Fallback a iniciales o emojis cuando falte imagen.

## 8. Referencias
- Documento de requisitos: `padelapp-product-brief.md`.
- Repositorio: `github.com/galiprandi/padelapp`.
- Dominio objetivo: `padelapp.app`.
