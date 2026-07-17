## 📋 BACKLOG
- [ ] Ofrecer un selector para restablecer a la foto original de Google si se guardó previamente.

## ✅ DONE
- [x] 2026-07-17 — Setup inicial del agente (sistema .ants creado)
- [x] 2026-07-18 — Mejoras en Onboarding y Perfil: Onboarding prompt en /me, dual CTA en agenda vacía, descripciones de niveles de juego y selector de avatar interactivo con presets de Dicebear. (PR #1 — merged)

## 🧠 LEARNINGS
## 2026-07-17 - Setup inicial
**Learning:** El sistema .ants fue creado con 4 agentes especializados para PadelApp. Cada agente tiene scope boundaries estrictas para evitar conflictos.
**Action:** Respetar las boundaries en cada run. Si una mejora requiere tocar otro scope, registrar en backlog y notificar en el PR.

## 2026-07-18 - Mejoras en Onboarding y Perfil
**Learning:** Los usuarios de primer ingreso necesitan indicaciones explícitas para completar su información (como alias y nivel) antes de participar en ranking y partidos. Un aviso prominente y contextual en el Dashboard (`/me`) reduce significativamente la fricción de inicio. Asimismo, brindar descripciones claras sobre los niveles de juego les permite auto-evaluarse de forma precisa.
**Action:** Mantener prompts de configuración de perfil prominentes y de alto contraste (siguiendo MDS) cuando existan datos críticos vacíos.
