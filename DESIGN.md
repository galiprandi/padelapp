# DESIGN.md – PadelApp

Este documento registra las decisiones de diseño, patrones de UI y arquitectura de componentes de **PadelApp**.

## 1. Patrones de UI
- **Rounded-xl**: Utilizado para componentes base como tarjetas de ranking y contenedores de jugadores.
- **Backdrop-blur-sm**: Para overlays de modales y menús flotantes (si aplica).
- **Uppercase tracking-widest**: Para encabezados de secciones pequeñas y etiquetas de "Sets" o "Categoría".

## 2. Componentes Clave
- **MatchPlayersManager**: Gestiona el estado y la edición de jugadores en un partido. Usa `ManageSlotModal` para acciones individuales.
- **RankingTable**: (En `/ranking/page.tsx`) Muestra la lista de jugadores ordenados por `rankingScore`. Incluye indicadores de tendencia (`TrendingUp`, `TrendingDown`).
- **EmptyState**: Componente reutilizable para secciones sin datos. Requiere un `title`, `description`, `icon` opcional y un `action` CTA.
- **UserRankingStats**: Familia de componentes (`UserRankingBanner`, `UserRankingCard`) para visualizar el estatus competitivo del usuario. Utiliza `backdrop-blur-sm` y `rounded-3xl` para mantener el "bubble" aesthetic.

## 3. Arquitectura de Datos
- **Prisma + PostgreSQL**: Fuente de verdad única. El modelo `User` ha sido extendido con campos de cache para ranking para optimizar lecturas rápidas en la tabla global.
- **Server Actions**: Se utilizan para todas las mutaciones de datos (`createMatchAction`, `saveMatchResultAction`, `recalculateRankingAction`).

## 4. Sistema de Ranking (V1)
- **Fórmula**: `score = 1000 + (wins * 15) + (streak * 5) + (setsWon * 1.5)`.
- **Atenuación**: Los puntos se reducen si el usuario no tiene actividad en 60 o 120 días.
- **Delta**: Se calcula comparando la `rankingPosition` anterior con la nueva tras un recalculado.
