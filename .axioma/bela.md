## 📋 BACKLOG
- [ ] Implementar Chat de Turnos con historial efímero mediante Socket.io y Redis cuando las variables de entorno de Upstash estén configuradas.

## ✅ DONE
- [x] 2026-07-17 — Setup inicial del agente (sistema .ants creado)
- [x] 2026-07-17 — Enforce Cooldown en acción de salvage manual `openToNetworkAction` para evitar spam de notificaciones.
- [x] 2026-07-17 — Refactorizar página de edición de turnos `/turnos/[id]/editar` a HTML semántico y escala Tailwind estándar (MDS).
- [x] 2026-07-18 — Sistema de "Recomendación proactiva de niveles" al crear y editar un turno para advertir al organizador sobre incompatibilidades de nivel.
- [x] 2026-07-18 — Corrección de error de compilación de Turbopack en `substitute-reminder` cron por incompatibilidad de `export const dynamic = "force-dynamic"` con `cacheComponents`.
- [x] 2026-07-19 — Implementación de Indicadores de Contactos en la Vista de Turnos y Corrección de la Recomendación de Niveles en Creación (PR #124)
- [x] 2026-07-20 — Adopción de Cache Components / PPR en la página pública de detalle de turno `/t/[id]` y esqueleto de carga de alta fidelidad (PR #125)
- [x] 2026-07-21 — Adopción completa de Cache Components / PPR en la página pública de detalle de turno /t/[id] mediante unificación de Suspense y remoción de "instant = false" (PR actual)
- [x] 2026-07-22 — Mejoras de Recuperación y Salvage de Turnos (UX de Cooldown interactivo y Conexiones Mutuas en Detalle de Turno)
- [x] 2026-07-23 — Alerta de Baja Tardía (late leave penalty) y habilitación del botón "Iniciar partido" para partidos con 4+ jugadores en turnos no llenos.

## 🧠 LEARNINGS
## 2026-07-17 - Setup inicial
**Learning:** El sistema .ants fue creado con 4 agentes especializados para Padel Red. Cada agente tiene scope boundaries estrictas para evitar conflictos.
**Action:** Respetar las boundaries en cada run. Si una mejora requiere tocar otro scope, registrar en backlog y notificar en el PR.

## 2026-07-17 - Salvage Cooldown
**Learning:** El salvage manual (`openToNetworkAction`) no poseía validación de cooldown por timestamp a nivel de base de datos, lo que permitía spam de notificaciones push de forma ilimitada por parte de los usuarios inscriptos.
**Action:** Unificar el criterio de cooldown (1 hora) tanto para el auto-salvage automático (cuando alguien se baja de un turno) como para el manual, optimizando el uso de recursos y protegiendo al usuario receptor del spam.

## 2026-07-18 - Recomendación de Niveles Proactiva
**Learning:** Mostrar advertencias de nivel de forma reactiva mientras el organizador crea o edita un turno ayuda enormemente a mejorar la calidad y paridad de los partidos creados sin necesidad de imponer bloqueos estrictos.
**Action:** Implementar siempre avisos proactivos claros utilizando estándares visuales sólidos de MDS (sin translucidez ni animaciones complejas) para guiar la experiencia de usuario de manera no intrusiva.

## 2026-07-19 - Clarificación de Escalas de Nivel e Indicadores Sociales
**Learning:** Debido a que el sistema de niveles de pádel es inverso (Nivel 1 es avanzado, Nivel 8 es principiante), los operadores de comparación simples pueden resultar confusos. Definir explícitamente variables auto-documentadas como `isUserWeakerThanSuggested = userLevel > suggestedLevel` previene errores lógicos. Al mismo tiempo, indicar qué jugadores en el turno son contactos del espectador usando un simple punto de color primario (`bg-primary`) impulsa fuertemente el engagement social sin añadir fricción visual.
**Action:** Mantener la claridad semántica al realizar comparaciones numéricas inversas y buscar siempre oportunidades no intrusivas para mostrar relaciones de contacto frecuentes en vistas públicas.

## 2026-07-20 - Adopción de PPR con Parámetros Asíncronos de Ruta
**Learning:** En Next.js 15+, los parámetros de ruta (`params`) se manejan como promesas de forma asíncrona. Bajo el esquema de Partial Prerendering (PPR), cualquier intento de resolver/esperar (`await`) estas promesas en el componente de página de nivel superior antes de entrar en un límite de `<Suspense>` desencadena errores de compilación por bailing de renderizado dinámico. El patrón óptimo es usar un componente contenedor síncrono que reciba `params` como promesa y lo delegue sin resolver al componente interno asíncrono envuelto en `<Suspense>`, donde finalmente es resuelto a nivel de streaming en tiempo de ejecución.
**Action:** Utilizar siempre envoltorios síncronos y delegación de promesas de `params` en componentes bajo límites de Suspense para adoptar PPR y acelerar los tiempos de respuesta estática iniciales.

## 2026-07-21 - Unificación de Suspense y Estructura Esqueleto para PPR en Turnos Públicos
**Learning:** Al usar Next.js with `cacheComponents: true` (PPR habilitado), las vistas públicas de los turnos no deben contener indicadores de exclusión dinámica como `export const instant = false`. Para completar la adopción, es imperativo mover la lógica asíncrona (como `auth()` o fetch de base de datos) al subcomponente envuelto en `<Suspense>`. El contenedor visual externo de layout (`main`) debe declararse en la página raíz estática y asincrónica para evitar la duplicación de clases CSS en el fallback y eliminar por completo los saltos de layout (CLS).
**Action:** Organizar siempre las vistas en un contenedor síncrono a nivel de página que encapsula la semántica de la cuadrícula o layout principal, y usar subcomponentes asíncronos para el streaming de datos e interacciones del cliente dentro de límites claros de Suspense.

## 2026-07-22 - Visualización del Cooldown y Propagación Social en Salvage
**Learning:** El botón "Salvar Turno" (`OpenToNetworkButton`) no mostraba retroalimentación sobre si estaba en cooldown hasta que el usuario hacía clic y recibía un error. Al pasando la fecha de última notificación (`lastNetworkNotificationAt`) y calcular un countdown en cliente de forma reactiva, mejoramos enormemente la UX del organizador. Adicionalmente, mapear las conexiones mutuas entre los jugadores según su orden cronológico de ingreso permite mostrar de manera clara cómo la red de contactos está ayudando a completar el turno, indicando etiquetas transparentes como "Contacto de [Nombre]".
**Action:** Evitar que el usuario realice acciones destinadas a fallar por lógica de negocio (como el cooldown) ocultando o deshabilitando elementos con explicaciones proactivas. Aprovechar el Player Graph local en memoria para enriquecer la interfaz con lazos sociales inmediatos que incrementen la confianza en la plataforma.

## 2026-07-23 - Alerta de Baja Tardía y Flexibilidad de Inicio para Creadores
**Learning:** El sistema reducía silenciosamente la reputación de asistencia de un jugador en un 5% si éste se bajaba de un turno con menos de 2 horas de anticipación, lo cual causaba frustración e incomprensión de las mecánicas de gamificación. Incorporar una advertencia proactiva en el modal de confirmación previene esto. Al mismo tiempo, restringir el inicio de un partido únicamente a cuando un turno estuviera lleno impedía a los organizadores avanzar el partido si tenían 4+ inscritos pero el turno era originalmente de 6 u 8. Habilitar dinámicamente este control si se alcanzan los 4 participantes recomendados elimina este cuello de botella y acelera el paso al juego.
**Action:** Informar siempre de forma transparente y proactiva de los impactos de reputación/gamificación en los flujos interactivos críticos antes de que el usuario los ejecute. Asegurar que las reglas de negocio de elegibilidad (como el inicio del partido) coincidan de forma fluida con las posibilidades de juego real.
