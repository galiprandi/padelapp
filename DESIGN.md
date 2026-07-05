# DESIGN.md – PadelApp

Este documento registra las decisiones de diseño, patrones de UI y arquitectura de componentes de **PadelApp**.

## 1. Patrones de UI (NEO-COURT: HUD Aesthetic)
- **Rounded-xl**: Estándar para celdas interactivas, botones y contenedores de alta tecnología. Reemplaza el antiguo "bubble aesthetic".
- **Glass-panel**: Utilidad central basada en `bg-zinc-950/40`, `backdrop-blur-2xl` y bordes `white/10`. Proporciona una estética de "herramienta profesional".
- **Hud-border**: Patrón de bordes con acentos en las esquinas (`clip-path`) que evoca una interfaz táctica.
- **Electric Indigo & Cyber Cyan**: Paleta disruptiva de alto contraste sobre un fondo **Deep Midnight** (`oklch(0.12 0.02 285)`).
- **Typography (Professional HUD)**:
  - **Headers**: `font-black`, `uppercase`, `italic`, `tracking-tighter`. Estilo agresivo de competición.
  - **Metadata/Stats**: `font-mono` (Geist Mono), `uppercase`, `tracking-widest`. Estética de telemetría deportiva.

## 2. Componentes Clave (Neural Edition)
- **NeuralHub**: La innovación central en navegación. Un **Floating Command Center** en la esquina inferior derecha que despliega un HUD de control total, eliminando las barras de navegación tradicionales y maximizando el espacio útil.
- **PageHeader**: Rediseñado como un módulo de telemetría con indicadores de sistema (`HUD_v1`), tipografía técnica y divisores de gradiente.
- **Card**: Evolucionado a "Frosted Tech Surfaces" con sombras profundas, iluminación interior y acentos HUD en las esquinas.
- **Button**: Targets táctiles de alta precisión con "Inner Glow" y feedback de escala agresivo (`active:scale-[0.96]`).
- **EmptyState**: Representado como un estado de `Data_Null` con estética de diagnóstico de sistema y animaciones de pulso.

## 3. Arquitectura de Datos
- **Prisma + PostgreSQL**: Fuente de verdad única. El modelo `User` ha sido extendido con campos de cache para ranking para optimizar lecturas rápidas en la tabla global.
- **Server Actions**: Se utilizan para todas las mutaciones de datos (`createMatchAction`, `saveMatchResultAction`, `recalculateRankingAction`).
- **Centralized Queries**: Las operaciones de lectura de base de datos para partidos de usuarios y acciones pendientes están centralizadas en `src/lib/match-queries.ts` para garantizar un filtrado, ordenamiento y mapeo de datos consistente entre el Dashboard, el Historial de Partidos y el Centro de Notificaciones.

## 4. Dashboard e Historial (High-Performance)
- **HUD Scannability**: Las listas utilizan la tipografía mono para fechas y puntuaciones, permitiendo una lectura rápida de la telemetría del partido.
- **Atmospheric Depth**: Uso sistemático de gradientes radiales de iluminación ambiental (`primary/20 blur-[120px]`) para separar las capas de información.
- **Priorización de Acciones**: El dashboard introduce una sección de "Acciones pendientes" ubicada en la parte superior para destacar tareas críticas (confirmar resultados o cargar scores de partidos pasados).

## 5. Navegación Disruptiva
- **Command Hub Priority**: El usuario interactúa con la app mediante un "Trigger" flotante. Esto reduce la fatiga visual y centraliza todas las acciones en un único punto táctil de alta visibilidad.
- **HUD Overlays**: Los menús no son páginas nuevas, sino capas de interfaz que emergen con desenfoque extremo, manteniendo el contexto de la actividad actual.

## 6. Integración de Flujos (Turnos -> Partidos)
- **Turnos como Lead**: Los turnos abiertos actúan como el embudo principal de jugadores.
- **Conversión Automática**: Al completar un turno (4 jugadores), el organizador puede disparar `convertTurnToMatchAction`, que hereda el club, los jugadores y las posiciones, marcando el turno como `COMPLETED`.

## 7. Sistema de Ranking (V9+ High-Fidelity)
- **Fórmula**: `score = 1000 + (wins * 15) + (streak * 5) + (setsWonBonus)`.
- **Sets Won Bonus**: +2 puntos por set ganado en partidos ganados; +1 punto por set ganado en partidos perdidos.
- **Jerarquía de Desempate**: 1) Score, 2) Reputación (Attendance), 3) Victorias totales, 4) Recencia (lastMatchAt).
- **Reputación (Attendance)**: Ratio de confirmaciones de resultado sobre el total de participaciones. Se visualiza como un porcentaje con el icono `ShieldCheck`.
- **Atenuación Temporal**: Los puntos se reducen (x0.5 o x0.25) si el usuario no tiene actividad en 60 o 120 días respectivamente para incentivar la participación continua.
- **Confirmación Cruzada**: Para que un resultado pase a `CONFIRMED`, al menos un jugador de cada equipo debe confirmarlo.

## 8. Typography and High-Impact Styling
- **Font-black standard**: Titles (`PageHeader`), section headers, and key interactive labels utilize `font-black` to ensure maximum visual weight.

## 9. Gestión de Perfil y Formularios
- **Visual Selector Grid**: La selección de parámetros se realiza mediante cuadrículas de botones táctiles con feedback de escala.
- **Organizer Management**: Las acciones críticas están restringidas al creador del partido mediante validaciones tanto en el cliente como en el servidor.

## 10. Vistas de Invitación (Públicas)
- **Conversion focus**: Implementan un contenedor CTA fijo en la parte inferior con un gradiente para guiar al usuario hacia el registro.
- **Public Player Profiles**: La ruta `/p/[userId]` permite visualizar el perfil de cualquier jugador sin necesidad de sesión.
- **Visual Sync**: Las vistas públicas comparten los mismos patrones de micro-typography y cards que la interfaz interna para una transición fluida.
