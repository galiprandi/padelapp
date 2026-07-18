## 📋 BACKLOG
- [ ] Añadir tracking o contador de contactos notificados que efectivamente se sumaron al turno.

## ✅ DONE
- [x] 2026-07-17 — Setup inicial del agente (sistema .ants creado)
- [x] 2026-07-17 — Enforce Cooldown en acción de salvage manual `openToNetworkAction` para evitar spam de notificaciones.
- [x] 2026-07-17 — Refactorizar página de edición de turnos `/turnos/[id]/editar` a HTML semántico y escala Tailwind estándar (MDS).
- [x] 2026-07-18 — Sistema de "Recomendación proactiva de niveles" al crear y editar un turno para advertir al organizador sobre incompatibilidades de nivel.
- [x] 2026-07-18 — Corrección de error de compilación de Turbopack en `substitute-reminder` cron por incompatibilidad de `export const dynamic = "force-dynamic"` con `cacheComponents`.

## 🧠 LEARNINGS
## 2026-07-17 - Setup inicial
**Learning:** El sistema .ants fue creado con 4 agentes especializados para PadelApp. Cada agente tiene scope boundaries estrictas para evitar conflictos.
**Action:** Respetar las boundaries en cada run. Si una mejora requiere tocar otro scope, registrar en backlog y notificar en el PR.

## 2026-07-17 - Salvage Cooldown
**Learning:** El salvage manual (`openToNetworkAction`) no poseía validación de cooldown por timestamp a nivel de base de datos, lo que permitía spam de notificaciones push de forma ilimitada por parte de los usuarios inscriptos.
**Action:** Unificar el criterio de cooldown (1 hora) tanto para el auto-salvage automático (cuando alguien se baja de un turno) como para el manual, optimizando el uso de recursos y protegiendo al usuario receptor del spam.

## 2026-07-18 - Recomendación de Niveles Proactiva
**Learning:** Mostrar advertencias de nivel de forma reactiva mientras el organizador crea o edita un turno ayuda enormemente a mejorar la calidad y paridad de los partidos creados sin necesidad de imponer bloqueos estrictos.
**Action:** Implementar siempre avisos proactivos claros utilizando estándares visuales sólidos de MDS (sin translucidez ni animaciones complejas) para guiar la experiencia de usuario de manera no intrusiva.
