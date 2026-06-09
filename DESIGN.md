# DESIGN.md – PadelApp

Este documento registra las decisiones de diseño, patrones de UI y arquitectura de componentes de **PadelApp**.

## 1. Patrones de UI
- **Rounded-xl**: Estándar para botones (`src/components/ui/button.tsx`), badges (`src/components/ui/badge.tsx`), contenedores de jugadores y campos de entrada.
- **Rounded-2xl**: Estándar para celdas interactivas secundarias como `SlotDisplay` y selectores de opciones en cuadrícula (Duración, Jugadores, Niveles).
- **Rounded-3xl / 2.5rem**: Utilizado para contenedores principales, secciones de formularios, tarjetas de resultados, cards de turnos y estados vacíos para crear el "bubble aesthetic". Las vistas de login y públicas usan `rounded-[2.5rem]` para un impacto visual más audaz.
- **Backdrop-blur-sm / md**: Para overlays de modales, menús flotantes y fondos de contenedores `bg-card/50` o `bg-primary/10`. Las vistas públicas de alta jerarquía utilizan `backdrop-blur-md`.
- **Uppercase tracking-widest**: Para micro-etiquetas de secciones pequeñas (usualmente `text-[10px] font-black`).

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

## 4. Dashboard Inteligente
- **Priorización de Acciones**: El dashboard introduce una sección de "Acciones pendientes" ubicada en la parte superior para destacar tareas críticas (confirmar resultados o cargar scores de partidos pasados). Esto asegura que el "Time to Action" sea mínimo para cerrar ciclos de partidos.
- **Unified Activity View (Agenda)**: La sección "Mi Agenda" se reserva exclusivamente para actividad futura (turnos y partidos próximos), proporcionando una vista limpia de planificación ordenada cronológicamente.
- **Hierarchical Separation**: Se utiliza un espacio estándar de `gap-12` para separar los bloques lógicos en vistas principales (Dashboard, Ranking, Turnos, Partidos). Esto asegura una respiración visual consistente y profesional.

## 5. Navegación y Operatividad
- **Navigation Priority**: La barra de navegación prioriza "Turnos" para incentivar la participación y descubrimiento de partidos.
- **Glassmorphism**: La barra de navegación utiliza `bg-zinc-950/90` y `backdrop-blur-lg` para integrarse suavemente con el contenido.
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

## 8. Typography and High-Impact Styling (V5)
- **Font-black standard**: Titles (`PageHeader`), section headers, and key interactive labels (Buttons, Navigation, Names in lists) utilize `font-black` (weight 900) to ensure maximum visual weight and a premium "bubble" feel.
- **Consistency**: All primary views are standardized with `gap-12` vertical spacing and `PageHeader size="lg"` for a balanced, spacious layout.

## 10. Gestión de Perfil y Formularios
- **Visual Selector Grid**: La selección de cantidad de sets (1, 3, 5), niveles, tipos de formato y marcadores se realiza mediante cuadrículas de botones táctiles (`rounded-2xl`) con feedback de escala y sombras, eliminando la necesidad de inputs numéricos nativos.
- **Form Fields**: Los inputs utilizan `rounded-xl`, `bg-background/50` y `h-12` para una ergonomía superior en dispositivos móviles.
- **Unified Profile Action**: Se prefiere una única acción para actualizar todos los campos del perfil (alias, nivel) para reducir latencia y asegurar consistencia atómica.

## 9. Vistas de Invitación (Públicas)
- **Shared Experience**: Las vistas bajo `/t/[id]` y `/m/[matchId]` están optimizadas para usuarios que no han iniciado sesión, utilizando el `PageHeader` centrado y micro-etiquetas de contexto claras ("Turno Abierto", "Invitación de Partido").
- **Conversion focus**: Implementan un contenedor CTA fijo en la parte inferior (`fixed bottom-0`) con un gradiente `bg-gradient-to-t` para guiar al usuario hacia el registro o la visualización del detalle completo. En el detalle de turno, se utiliza un `pb-40` para evitar oclusiones.
- **Public Player Profiles**: La ruta `/p/[userId]` permite visualizar el perfil de cualquier jugador sin necesidad de sesión. Utiliza el `UserRankingBanner` para mostrar el estatus competitivo y el historial de últimos 5 partidos confirmados mediante `MatchResultCompact`.
- **Sharing Integrated**: El detalle de partido incluye acciones de compartición contextuales (invitación para partidos abiertos, resultados para partidos cerrados) utilizando el componente `ShareButton` y URLs generadas vía `createMagicLink` para maximizar la viralidad orgánica.
- **Visual Consistency**: Reutilizan el patrón de grid 2x2 para información técnica y `rounded-[2.5rem]` para las tarjetas principales con `shadow-2xl` y `backdrop-blur-md`, asegurando que la primera impresión de la app sea profesional y alineada con la identidad visual interna.
- **Marketing Refinement**: La landing page (`/`) y la página de instalación (`/install`) utilizan el mismo patrón de card de alto impacto (`rounded-[2.5rem]`) y el fondo de gradiente radial para garantizar que la experiencia de marca comience desde el primer contacto.
