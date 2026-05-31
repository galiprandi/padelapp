# DESIGN.md – PadelApp

Este documento registra las decisiones de diseño, patrones de UI y arquitectura de componentes de **PadelApp**.

## 1. Patrones de UI
- **Rounded-xl**: Utilizado para componentes base como contenedores de jugadores y campos de entrada de formularios.
- **Rounded-3xl / 2.5rem**: Utilizado para contenedores principales, secciones de formularios, tarjetas de resultados, cards de turnos y estados vacíos para crear el "bubble aesthetic". Las vistas de login y públicas usan `rounded-[2.5rem]` para un impacto visual más audaz.
- **Backdrop-blur-sm**: Para overlays de modales, menús flotantes y fondos de contenedores `bg-card/50` o `bg-primary/10`.
- **Uppercase tracking-widest**: Para micro-etiquetas de secciones pequeñas (usualmente `text-[10px] font-bold`).

## 2. Componentes Clave
- **MatchPlayersManager**: Gestiona el estado y la edición de jugadores en un partido. Usa `ManageSlotModal` para acciones individuales.
- **RankingList**: (En `/ranking/page.tsx`) Lista de jugadores refinada con estética "bubble", indicadores de posición en `rounded-2xl` y badges de nivel consistentes.
- **EmptyState**: Componente refinado para secciones sin datos. Utiliza `bg-card/50`, bordes sólidos (`border-border/40`), un generoso padding vertical (`py-16`) e iconos destacados en círculos `bg-primary/5` para mantener la jerarquía visual del "bubble aesthetic".
- **UserRankingStats**: Familia de componentes (`UserRankingBanner`, `UserRankingCard`) para visualizar el estatus competitivo del usuario. Utiliza `backdrop-blur-sm` y `rounded-3xl` para mantener el "bubble" aesthetic.
- **TurnCard**: Componente unificado para mostrar turnos abiertos en listas y dashboards. Soporta variantes `default` y `recommended` (con acento en `bg-primary`) e incluye un badge de "Inscripto" si el usuario ya forma parte del turno, manteniendo la jerarquía visual con micro-etiquetas uppercase y fecha destacada.
- **MatchResultCard / MatchResultCompact**: Polished UI para resultados. Los segmentos de score son cuadrados perfectos (`h-9 w-9`) con `rounded-xl`. El equipo ganador destaca sus sets con `bg-primary`. El estado de confirmación pendiente usa un pulso animado para captar atención.
- **Match Confirmation Flow**: Los partidos con resultado pendiente de confirmación muestran un banner de "Confirmación pendiente" con indicadores individuales (`CheckCircle2` para confirmados, `Clock` para pendientes) para incentivar el cierre del partido y el impacto en el ranking.

## 3. Arquitectura de Datos
- **Prisma + PostgreSQL**: Fuente de verdad única. El modelo `User` ha sido extendido con campos de cache para ranking para optimizar lecturas rápidas en la tabla global.
- **Server Actions**: Se utilizan para todas las mutaciones de datos (`createMatchAction`, `saveMatchResultAction`, `recalculateRankingAction`).

## 4. Dashboard (Mi Agenda)
- **Unified Activity View**: El dashboard consolida turnos y partidos próximos en una sola sección de "Mi Agenda", ordenada cronológicamente mediante el campo `date` (heredado de turnos o asignado en la creación) para reducir la carga cognitiva del usuario.
- **Hierarchical Separation**: Se utiliza un espacio amplio (`gap-12`) para separar la sección de perfil/ranking de la agenda operativa.

## 5. Integración de Flujos (Turnos -> Partidos)
- **Turnos como Lead**: Los turnos abiertos actúan como el embudo principal de jugadores.
- **Conversión Automática**: Al completar un turno (4 jugadores), el organizador puede disparar `convertTurnToMatchAction`, que hereda el club, los jugadores y las posiciones, marcando el turno como `COMPLETED`.
- **Pre-llenado de Formulario**: El hook `useMatchForm` soporta la inicialización mediante `turnId` para mantener la flexibilidad si se desea ajustar el partido antes de crearlo.

## 6. Sistema de Ranking (V1)
- **Fórmula**: `score = 1000 + (wins * 15) + (streak * 5) + (setsWon * 1.5)`.
- **Atenuación**: Los puntos se reducen si el usuario no tiene actividad en 60 o 120 days.
- **Delta**: Se calcula comparando la `rankingPosition` anterior con la nueva tras un recalculado.
- **Confirmación Cruzada**: Para que un resultado pase a `CONFIRMED`, al menos un jugador de cada equipo debe confirmarlo. Esto previene cargas unilaterales erróneas.

## 7. Gestión de Perfil
- **Visual Level Selector**: Los niveles se presentan en una cuadrícula de botones (`rounded-2xl`) para facilitar la selección táctil en móviles, evitando selects nativos o inputs numéricos.
- **Unified Profile Action**: Se prefiere una única acción para actualizar todos los campos del perfil (alias, nivel) para reducir latencia y asegurar consistencia atómica.
