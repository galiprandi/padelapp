## 📋 BACKLOG

## ✅ DONE
- [x] 2026-07-17 — Setup inicial del agente (sistema .ants creado)
- [x] 2026-07-18 — Mejoras en Onboarding y Perfil: Onboarding prompt en /me, dual CTA en agenda vacía, descripciones de niveles de juego y selector de avatar interactivo con presets de Dicebear. (PR #1 — merged)
- [x] 2026-07-19 — Foto original de Google: Ofrecer selector para restablecer a la foto original de Google decodificando el `id_token` de la cuenta vinculada del usuario.
- [x] 2026-07-20 — Adopción completa de Cache Components (PPR) en el módulo de Perfil, Login y Onboarding. (PR #roby/profile/cache-components-onboarding)
- [x] 2026-07-21 — Compartición nativa de perfil y navegación contextualizada del perfil público. (PR #roby/profile/share-and-back-navigation)

## 🧠 LEARNINGS
## 2026-07-17 - Setup inicial
**Learning:** El sistema .ants fue creado con 4 agentes especializados para Padel Red. Cada agente tiene scope boundaries estrictas para evitar conflictos.
**Action:** Respetar las boundaries en cada run. Si una mejora requiere tocar otro scope, registrar en backlog y notificar en el PR.

## 2026-07-18 - Mejoras en Onboarding y Perfil
**Learning:** Los usuarios de primer ingreso necesitan indicaciones explícitas para completar su información (como alias y nivel) antes de participar en ranking y partidos. Un aviso prominente y contextual en el Dashboard (`/me`) reduce significativamente la fricción de inicio. Asimismo, brindar descripciones claras sobre los niveles de juego les permite auto-evaluarse de forma precisa.
**Action:** Mantener prompts de configuración de perfil prominentes y de alto contraste (siguiendo MDS) cuando existan datos críticos vacíos.

## 2026-07-19 - Restaurar Avatar de Google
**Learning:** Se puede recuperar la URL original de la foto de Google de un usuario decodificando el `id_token` de la tabla `Account` almacenado por NextAuth. Esto evita tener que almacenar de forma redundante o añadir un nuevo campo a la base de datos (lo cual alteraría el schema, que está fuera de scope).
**Action:** Siempre buscar soluciones de datos creativas utilizando la información JWT existente o relaciones cruzadas antes de sugerir cambios en el esquema de base de datos.

## 2026-07-20 - Adopción de Cache Components y PPR en Onboarding
**Learning:** Para lograr una experiencia de usuario instantánea y fluida, las páginas y flujos clave como el Perfil (`/me/profile`), el inicio de sesión (`/login`), el perfil público de jugadores (`/p/[userId]`), y las invitaciones directas (`/j/[playerId]`) deben ser totalmente compatibles con Next.js Cache Components (Partial Prerendering). Al separar la estructura estática y de encabezados (la "cáscara" o shell) de las llamadas a bases de datos y validaciones de sesión (`auth()`), y envolver estas últimas en `<Suspense>` con un esqueleto visual de alta fidelidad, el usuario percibe una carga instantánea y sin saltos visuales incómodos.
**Action:** Estructurar las páginas de Next.js aislando siempre las APIs dinámicas o asíncronas en sub-componentes envueltos en Suspense, garantizando una carga progresiva y un primer renderizado instantáneo.

## 2026-07-21 - Compartición de Perfil y Navegación Contextual (PPR)
**Learning:** El acceso directo a parámetros dinámicos como `searchParams` en componentes de página de nivel superior de Next.js rompe el prerenderizado de páginas estáticas e interrumpe la Partial Prerendering (PPR). Para aislar estos efectos, los elementos dinámicos (como un botón de retroceso que lee `backUrl`) deben encapsularse en su propio componente dinámico y envolverse en un bloque `<Suspense>` con un esqueleto fallback equivalente en tamaño para evitar saltos de diseño (layout shifts).
Además, la integración de la acción de compartir (`ShareButton`) nativa tanto en el perfil propio como en los perfiles de otros jugadores eleva significativamente el engagement y la viralidad orgánica de la plataforma.
**Action:** Encapsular siempre los lectores de query parameters en subcomponentes de Suspense, y priorizar puntos de acción sociales (compartir perfiles) de baja fricción en la UI.
