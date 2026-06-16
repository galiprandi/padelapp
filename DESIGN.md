# DESIGN.md – PadelApp

Este documento registra las decisiones de diseño, patrones de UI y arquitectura de componentes de **PadelApp**.

## 1. Patrones de UI
- **Rounded-xl**: Estándar para botones secundarias (`src/components/ui/button.tsx`), badges (`src/components/ui/badge.tsx`), contenedores de jugadores y campos de entrada.
- **Rounded-2xl**: Estándar para celdas interactivas secundarias como `SlotDisplay`, botones primarios de alto impacto, y selectores de opciones en cuadrícula (Duración, Jugadores, Niveles).
- **Rounded-3xl / 2.5rem**: Utilizado para contenedores principales, secciones de formularios, tarjetas de resultados, cards de turnos y estados vacíos para crear el "bubble aesthetic". Las vistas de login y públicas usan `rounded-[2.5rem]` para un impacto visual más audaz.
- **Backdrop-blur-sm / md**: Para overlays de modales, menús flotantes y fondos de contenedores `bg-card/50` o `bg-primary/10`. Las vistas públicas de alta jerarquía utilizan `backdrop-blur-md`.
- **Uppercase tracking-widest**: Para micro-etiquetas de secciones y etiquetas de acción. Estándar V8: `text-[11px] font-black uppercase tracking-widest text-muted-foreground/70` para encabezados de sección, y `text-[10px]` para micro-links.

## 2. Componentes Clave
- **MatchPlayersManager**: Gestiona el estado y la edición de jugadores en un partido. Usa `ManageSlotModal` para acciones individuales.
- **RankingList**: (En `/ranking/page.tsx`) Lista de jugadores refinada con un **Podio de Honor** para el Top 3. Los líderes destacan con avatares de mayor tamaño, bordes metálicos (oro, plata, bronce) y trofeos animados. La lista global utiliza `rounded-3xl`, avatares integrados y tipografía `font-black` para una estética premium.
- **EmptyState**: Componente refinado para secciones sin datos. Utiliza `bg-card/50`, bordes sólidos (`border-border/40`), un generoso padding vertical (`py-16`) e iconos destacados en círculos `bg-primary/5` para mantener la jerarquía visual del "bubble aesthetic".
- **UserRankingStats**: Familia de componentes (`UserRankingBanner`, `UserRankingCard`) para visualizar el estatus competitivo del usuario. Utiliza `backdrop-blur-sm` y `rounded-3xl` para mantener el "bubble" aesthetic.
- **TurnCard**: Componente unificado para mostrar turnos abiertos en listas y dashboards. Soporta variantes `default` y `recommended` (con acento en `bg-primary`) e incluye un badge de "Inscripto" si el usuario ya forma parte del turno, manteniendo la jerarquía visual con micro-etiquetas uppercase y fecha destacada.
- **MatchResultCard / MatchResultCompact**: Polished UI para resultados. Utiliza una separación visual "vs" entre equipos. El equipo ganador se identifica con iconos de trofeo. Los segmentos de score son cuadrados perfectos (`h-9 w-9`) con `rounded-xl` y sombras dinámicas; los sets ganados escalan sutilmente (`scale-105`) para énfasis visual.
- **Match Confirmation Flow**: La sección de confirmación utiliza un diseño de tarjetas individuales para cada jugador (`bg-emerald-500/5` para confirmados) con avatares de gran tamaño y micro-etiquetas de estado, asegurando una visibilidad máxima en móviles.

## 3. Arquitectura de Datos
- **Prisma + PostgreSQL**: Fuente de verdad única. El modelo `User` ha sido extendido con campos de cache para ranking para optimizar lecturas rápidas en la tabla global.
- **Server Actions**: Se utilizan para todas las mutaciones de datos (`createMatchAction`, `saveMatchResultAction`, `recalculateRankingAction`).
- **Centralized Queries**: Las operaciones de lectura de base de datos para partidos de usuarios y acciones pendientes están centralizadas en `src/lib/match-queries.ts` para garantizar un filtrado, ordenamiento y mapeo de datos consistente entre el Dashboard, el Historial de Partidos y el Centro de Notificaciones.

## 4. Dashboard Inteligente y Historial
- **Priorización de Acciones**: El dashboard introduce una sección de "Acciones pendientes" ubicada en la parte superior para destacar tareas críticas (confirmar resultados o cargar scores de partidos pasados). Esto asegura que el "Time to Action" sea mínimo para cerrar ciclos de partidos.
- **Unified Activity View (Agenda)**: La sección "Mi Agenda" se reserva exclusivamente para actividad futura (turnos y partidos próximos), proporcionando una vista limpia de planificación ordenada cronológicamente.
- **Hierarchical Separation**: Se utiliza un espacio estándar de `gap-12` para separar los bloques lógicos en vistas principales (Dashboard, Ranking, Turnos, Partidos, Notificaciones). Esto asegura una respiración visual consistente y profesional.
- **Match Day Intelligence**: Los elementos de la agenda que ocurren en el día actual se destacan con un badge "Hoy" con animación pulse de color primario para priorizar acciones inmediatas. Los eventos de mañana usan un badge "Mañana" más discreto.
- **Match History Refinement**: El historial de partidos (`/match`) evoluciona hacia un modelo híbrido: prioriza "Acciones pendientes" (confirmaciones/cargas) en la parte superior y mantiene un historial cronológico claro abajo. Utiliza el "bubble aesthetic" con cards de alto impacto para estados no autenticados y un Floating Action Button (FAB) con feedback táctil pronunciado (`active:scale-90`). FAB estándar: `h-16 w-16`, `rounded-[1.25rem]`, borde `4px border-background`.
- **Personal Relevance Branding**: Los componentes de lista (`TurnCard`, `MatchResultCompact`) implementan una capa de personalización que resalta el equipo del usuario y utiliza etiquetas como "Tú" o "Organizador" para reducir la carga cognitiva y mejorar el "Time to Insight".

## 5. Navegación y Operatividad
- **Navigation Priority**: La barra de navegación prioriza "Turnos" para incentivar la participación y descubrimiento de partidos.
- **Glassmorphism**: La barra de navegación utiliza `bg-zinc-950/90` y `backdrop-blur-lg` para integrarse suavemente con el contenido.
- **Notifications Center**: Se implementa un Centro de Notificaciones dedicado en `/notifications` para agregar todas las acciones pendientes de partidos (scores y confirmaciones), complementado por un badge de conteo dinámico en el `BottomNav`.
- **Tactile Feedback**: Componentes interactivos como `TurnCard`, `MatchResultCard` y botones implementan `active:scale-[0.98]` para una sensación de respuesta nativa. Los botones flotantes de acción (FAB) en móviles utilizan `active:scale-90` para un feedback más pronunciado. Los selectores de cuadrícula proporcionan feedback visual inmediato al seleccionar opciones.

## 6. Integración de Flujos (Turnos -> Partidos)
- **Turnos como Lead**: Los turnos abiertos actúan como el embudo principal de jugadores.
- **Conversión Automática**: Al completar un turno (4 jugadores), el organizador puede disparar `convertTurnToMatchAction`, que hereda el club, los jugadores y las posiciones, marcando el turno como `COMPLETED`.
- **Pre-llenado de Formulario**: El hook `useMatchForm` soporta la inicialización mediante `turnId` para mantener la flexibilidad si se desea ajustar el partido antes de crearlo.

## 7. Sistema de Ranking (V1)
- **Fórmula**: `score = 1000 + (wins * 15) + (streak * 5) + (setsWon * 1.5)`.
- **Atenuación**: Los puntos se reducen si el usuario no tiene actividad en 60 o 120 days.
- **Delta**: Se calcula comparando la `rankingPosition` anterior con la nueva tras un recalculado.
- **Confirmación Cruzada**: Para que un resultado pase a `CONFIRMED`, al menos un jugador de cada equipo debe confirmarlo. Esto previene cargas unilaterales erróneas.

## 8. Typography and High-Impact Styling (V5+)
- **Font-black standard**: Titles (`PageHeader`), section headers, and key interactive labels (Buttons, Navigation, Names in lists) utilize `font-black` (weight 900) to ensure maximum visual weight and a premium "bubble" feel.
- **V6 Consistency**: Views adhere to a strict `px-6` padding standard for app containers and public detail views. All interactive cards and primary buttons utilize `rounded-2xl` or higher to maintain the high-fidelity bubble aesthetic.

## 9. Gestión de Perfil y Formularios
- **Visual Selector Grid**: La selección de cantidad de sets (1, 3, 5), niveles, tipos de formato y marcadores se realiza mediante cuadrículas de botones táctiles (`rounded-2xl`) con feedback de escala y sombras, eliminando la necesidad de inputs numéricos nativos.
- **Form Fields**: Los inputs utilizan `rounded-xl`, `bg-background/50` y `h-12` para una ergonomía superior en dispositivos móviles.
- **Unified Profile Action**: Se prefiere una única acción para actualizar todos los campos del perfil (alias, nivel) para reducir latencia y asegurar consistencia atómica.
- **Organizer Management**: Las acciones críticas de gestión de partidos (intercambiar jugadores, liberar cupos, renombrar placeholders) están restringidas al creador del partido mediante validaciones tanto en el cliente (condicional UI) como en el servidor (Server Actions).
- **Atomic Player Swap**: El intercambio de jugadores utiliza una transacción de base de datos con posiciones temporales para garantizar la integridad referencial y evitar conflictos de unicidad en el esquema.

## 10. Vistas de Invitación (Públicas)
- **Shared Experience**: Las vistas bajo `/t/[id]` y `/m/[matchId]` están optimizadas para usuarios que no han iniciado sesión, utilizando el `PageHeader` centrado y micro-etiquetas de contexto claras ("Turno Abierto", "Invitación de Partido").
- **Conversion focus**: Implementan un contenedor CTA fijo en la parte inferior (`fixed bottom-0`) con un gradiente `bg-gradient-to-t` para guiar al usuario hacia el registro o la visualización del detalle completo. En el detalle de turno, se utiliza un `pb-40` para evitar oclusiones.
- **Public Player Profiles**: La ruta `/p/[userId]` permite visualizar el perfil de cualquier jugador sin necesidad de sesión. Utiliza el `UserRankingBanner` para mostrar el estatus competitivo y el historial de últimos 5 partidos confirmados mediante `MatchResultCompact`.
- **Sharing Integrated**: El detalle de partido incluye acciones de compartición contextuales (invitación para partidos abiertos, resultados para partidos cerrados) utilizando el componente `ShareButton` y URLs generadas vía `createMagicLink` para maximizar la viralidad orgánica.
- **Visual Consistency**: Reutilizan el patrón de grid 2x2 para información técnica y `rounded-[2.5rem]` para las tarjetas principales con `shadow-2xl` y `backdrop-blur-md`, asegurando que la primera impresión de la app sea profesional y alineada con la identidad visual interna.
- **Marketing Refinement**: La landing page (`/`) y la página de instalación (`/install`) utilizan el mismo patrón de card de alto impacto (`rounded-[2.5rem]`) y el fondo de gradiente radial para garantizar que la experiencia de marca comience desde el primer contacto.

## 11. Instant Match Recording (V7)
- **Time-to-Value Optimization**: El flujo de creación de partidos integra un paso opcional de "Carga de resultado instantánea" (Step 4). Esto permite registrar partidos pasados en una única sesión, eliminando la necesidad de navegar al detalle del partido tras su creación.
- **Visual Hierarchy (Dashboard)**: El PageHeader del Dashboard prioriza el botón "Nuevo Partido" como acción primaria (`h-14`, `rounded-2xl`, `shadow-lg shadow-primary/20`), relegando la gestión de perfil y ranking a botones secundarios para agilizar el ciclo de registro de actividad.
- **High-Impact Scores**: En la vista de detalle de partidos cerrados, el marcador se presenta con tipografía `text-6xl font-black` y efectos de iluminación (`aura primary/20`) para celebrar el resultado y proporcionar una lectura inmediata del desenlace.

## 12. Premium Refinement V8 (Consistencia y Pulido)
- **Standardized Micro-labels**: Se unifica la tipografía de encabezados de sección a `text-[11px] font-black uppercase tracking-widest text-muted-foreground/70`. Los enlaces de "Ver todas" se estandarizan a `text-[10px] font-black uppercase tracking-widest text-primary` con feedback táctil `active:scale-95`.
- **Primary Action Refinement**: Los botones de acción principal en cabeceras (`PageHeader`) se estandarizan a `h-14`, `rounded-2xl`, `font-black`, y `shadow-lg shadow-primary/20` con `active:scale-[0.98]`.
- **High-Impact Score Detail**: La visualización de resultados cerrados en el detalle de partido evoluciona a un contenedor con `backdrop-blur-xl`, animaciones escalonadas para scores y jugadores, y una jerarquía visual superior para celebrar el resultado.
- **Navigation Consistency**: Se integra el botón de "Volver" (`backHref`) en el Centro de Notificaciones para mantener la consistencia de navegación en todas las vistas de detalle o gestión.
