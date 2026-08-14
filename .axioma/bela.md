## 📋 BACKLOG

## ✅ DONE
- [x] 2026-08-13 — Argentine Spanish Toast Feedback and Tactile Scaling in AssignSubstituteButton (bela/turnos/assign-substitute-toast-and-ux)
- [x] 2026-08-12 — Turn Chat Localized Timestamps and Scroll UX Optimization (bela/turnos/chat-timestamps-ux)
- [x] 2026-08-10 — Turn Card Cooldown and Offline Visual Test Coverage (bela/turnos/turn-card-cooldown)
- [x] 2026-08-11 — Turn Chat with Ephemeral Upstash Redis Storage and System Bot (bela/turnos/turn-chat-implementation)
- [x] 2026-08-09 — Argentine Spanish Voice & Language Standardization (bela/turnos/voice-language-standardization)
- [x] 2026-08-08 — Contextual Quick-Join, Branded Active Toast Copy & MDS Styling Refinement (bela/turnos/quick-join-and-copy-polish)
- [x] 2026-08-06 — Future-Date Turn Validation & Branded Toast Alignment (bela/turnos/future-date-validation-and-branded-toasts)
- [x] 2026-08-05 — Modernized Turn Action Confirmations (bela/turnos/modern-confirmations)
- [x] 2026-08-03 — Interactive WhatsApp Invite Recommendations (bela/turnos/whatsapp-invite-suggestions)
- [x] 2026-08-01 — Turn Social Proof & Contact Highlights (bela/turnos/social-proof-contacts)
- [x] 2026-07-17 — Setup inicial del agente (sistema .ants creado)
- [x] 2026-07-17 — Enforce Cooldown en acción de salvage manual `openToNetworkAction` para evitar spam de notificaciones.
- [x] 2026-07-17 — Refactorizar página de edición de turnos `/turnos/[id]/editar` a HTML semántico y escala Tailwind estándar (MDS).
- [x] 2026-07-18 — Sistema de "Recomendación proactiva de niveles" al crear y editar un turno para advertir al organizador sobre incompatibilidades de nivel.
- [x] 2026-07-18 — Corrección de error de compilación de Turbopack en `substitute-reminder` cron por incompatibilidad de `export const dynamic = "force-dynamic"` con `cacheComponents`.
- [x] 2026-07-19 — Implementación de Indicadores de Contactos en la Vista de Turnos y Corrección de la Recomendación de Niveles en Creación (PR #124)
- [x] 2026-07-20 — Adopción de Cache Components / PPR en la página pública de detalle de turno `/t/[id]` y esqueleto de carga de alta fidelidad (PR #125)
- [x] 2026-07-21 — Adopción completa de Cache Components / PPR en la página pública de detalle de turno /t/[id] mediante unificación de Suspense y remoción de "instant = false" (PR actual)
- [x] 2026-07-22 — Mejoras de Recuperación y Salvage de Turnos (UX de Cooldown interactivo y Conexiones Mutuas en Detalle de Turno)
- [x] 2026-07-23 — Alerta de Baja Tardía (late leave penalty) and habilitación del botón "Iniciar partido" para partidos con 4+ jugadores en turnos no llenos.
- [x] 2026-07-24 — Refactorización estética de Creación de Turnos a Estándares MDS y botón Volver (PR actual)
- [x] 2026-07-25 — Integración del botón de "Agregar al Calendario" para reducir olvidos y cancelaciones de turnos.
- [x] 2026-07-26 — Filtro interactivo de Turnos "Todos" vs "Mis Turnos" bajo estándares MDS (PPR compatible)
- [x] 2026-07-27 — Botones de Acción Interactivos en Detalle de Turno con Estados de Carga (PR actual)
- [x] 2026-07-28 — Estandarización de Filtros Sólidos y Cooldown en Tarjetas de Turno (PR bela/turnos/solid-filters-and-cooldown)
- [x] 2026-07-30 — Barra de Progreso de Turnos y CTA Contextual de Invitación para Cupos Vacíos (PR bela/turnos/progress-and-contextual-invite)
- [x] 2026-07-31 — Spanish Dynamic Turn Notification Relative Date Formatting (bela/turnos/dynamic-relative-dates)

## 🧠 APRENDIZAJES
## 2026-08-13 - Argentine Spanish Toast Feedback and Tactile Scaling in AssignSubstituteButton
**Learning:** Providing immediate feedback when organizers promote substitutes to active slots prevents double-clicking and gives clear operational confirmation. Using active voice in Argentine Spanish ("Promoviste a [Nombre] a titular.") aligns with project brand voice guidelines while tactile scaling (`active:scale-[0.98] transition-all`) delivers expected MDS micro-UX feedback.
**Action:** Always capture server action responses in client button components to dispatch localized toast notifications and apply tactile scaling to interactive triggers.

## 2026-08-12 - Turn Chat Localized Timestamps and Scroll UX Optimization
**Learning:** Adding timestamps to real-time communication modules (like Turn Chat) is critical for user coordination, as relative messages like "Llego 10 min tarde" lose value without chronological context. Implementing this purely on the client side with a decoupled, pure-function utility ensures deterministic, fast testing and avoids server-side NextAuth or Next.js transitive import issues in the test runner. Additionally, snapping the scroll position instantly (`auto`) on the initial rendering of the chat, while using smooth scrolling (`smooth`) only for subsequent incoming messages, significantly enhances the perceived loading speed and transitions.
**Action:** Keep date and time formatting utilities pure and self-contained to avoid import pollution in Vitest. Use stateful references (`useRef`) to manage different scroll behavior modes between initial loads and dynamic updates.

## 2026-08-10 - Turn Card Cooldown and Offline Visual Test Coverage
**Learning:** Forgetting to pass cooldown metadata (like `lastNetworkNotificationAt`) from query results down to listing components (like `TurnCard`'s `OpenToNetworkButton`) creates user frustration because they cannot see whether their "Salvar turno" action is on cooldown until after clicking. Passing this timestamp and enhancing prop types to accept `Date | string | null` is vital since Date serialization over Next.js Server/Client boundary converts them to strings. Additionally, ensuring public queries like `getCachedOpenTurns` have robust AUTH_BYPASS mocks is crucial for Playwright E2E and visual testing to run cleanly offline.
**Action:** Always verify that cooldown metadata fetched in the queries is properly declared in card props and propagated to interactive triggers. Include comprehensive mock values under bypass inside queries so that automated QA tools can verify listing state visuals.

## 2026-08-06 - Future-Date Turn Validation & Branded Toast Alignment
**Learning:** Scheduling events (turnos) in the past corrupts listing logic and leads to dead links/records. Validating date/time during client-side submit events using `Date.now()` is safe and timezone-proof. Additionally, adding a 5-minute clock-skew window (`Date.now() - 5 * 60 * 1000`) on the server actions prevents minor network delays or client/server clock drifts from causing validation errors.
**Action:** Enforce future-date constraint checks both in forms (client-side) and server actions (server-side) with a 5-minute skew tolerance. Align all interactive feedback toasts to the active voice and strictly avoid exclamation points (`¡`, `!`) to comply with the project's Voice & Language specifications.

## 2026-08-05 - Modernized Turn Action Confirmations
**Learning:** Browser native `confirm()` popups feel extremely unpolished, unbranded, and interruptive on modern mobile PWA applications. Creating state-driven inline confirmations that fit gracefully within existing grid rows or expand into detailed explanatory cards (with side-by-side cancel and action triggers) drastically improves user focus, provides valuable context, and complies perfectly with Minimal Design System (MDS) design maxims.
**Action:** Always avoid default window-level dialogs like `confirm()` or `alert()`. Opt for stateful React custom-rendered inline layouts with transition pending loaders for destructive or final actions.

## 2026-08-03 - Interactive WhatsApp Invite Recommendations
**Learning:** Recommending specific player contacts to invite with individual single-click WhatsApp share buttons drastically bridges the gap between wanting to fill a slot and taking action. Performing the dynamic text format client-side inside a React useEffect preserves strict Next.js PPR rendering compliance and keeps browser-specific timezones accurate.
**Action:** Always provide proactive recommendation triggers when slots are open, accompanied by single-tap personalized share options using relative localized date and time formats.

## 2026-08-01 - Turn Social Proof & Contact Highlights
**Learning:** Showing social proof (such as which of the viewer's padel contacts are already playing) on high-level list views like `/turnos` or the `/me` dashboard drastically drives user engagement and conversion for salvaging incomplete turns. This requires nested profile retrieval in parent queries while maintaining strict Next.js PPR boundaries.
**Action:** Always seek to propagate minimal, high-impact social proof triggers in summary cards (e.g. TurnCard) by passing contextual contacts down from layout/shell components.

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
**Learning:** En Next.js 15+, los parámetros de ruta (`params`) se manejan como promesas de forma asíncrona. Bajo el esquema de Partial Prerendering (PPR), cualquier intento de resolver/esperar (`await`) estas promesas en el componente de página de nivel superior antes de entrar en un límite de `<Suspense>` desencadena errores de compilación por bailing de renderizado dinámico. El patrón óptimo is usar un componente contenedor síncrono que reciba `params` as promesa y lo delegue sin resolver al componente interno asíncrono envuelto en `<Suspense>`, donde finalmente es resuelto a nivel de streaming en tiempo de ejecución.
**Action:** Utilizar siempre envoltorios sínconos y delegación de promesas de `params` en componentes bajo límites de Suspense para adoptar PPR y acelerar los tiempos de respuesta estática iniciales.

## 2026-07-21 - Unificación de Suspense y Estructura Esqueleto para PPR en Turnos Públicos
**Learning:** Al usar Next.js with `cacheComponents: true` (PPR habilitado), las vistas públicas de los turnos no deben contener indicadores de exclusión dinámica como `export const instant = false`. Para completar la adopción, es imperativo mover la lógica asíncrona (como `auth()` o fetch de base de datos) al subcomponente envuelto en `<Suspense>`. El contenedor visual externo de layout (`main`) debe declararse en la página raíz estática y asincrónica para evitar la duplicación de clases CSS en el fallback y eliminar por completo los saltos de layout (CLS).
**Action:** Organizar siempre las vistas en un contenedor síncrono a nivel de página que encapsula la semántica de la cuadrícula o layout principal, y usar subcomponentes asínconos para el streaming de datos e interacciones del cliente dentro de límites claros de Suspense.

## 2026-07-22 - Visualización del Cooldown y Propagación Social en Salvage
**Learning:** El botón "Salvar Turno" (`OpenToNetworkButton`) no mostraba retroalimentación sobre si estaba en cooldown hasta que el usuario hacía clic y recibía un error. Al pasando la fecha de última notificación (`lastNetworkNotificationAt`) y calcular un countdown en cliente de forma reactiva, mejoramos enormemente la UX del organizador. Adicionalmente, mapear las conexiones mutuas entre los jugadores según su orden cronológico de ingreso permite mostrar de manera clara cómo la red de contactos está ayudando a completar el turno, indicando etiquetas transparentes como "Contacto de [Nombre]".
**Action:** Evitar que el usuario realice acciones destinadas a fallar por lógica de negocio (como el cooldown) ocultando o deshabilitando elements con explicaciones proactivas. Aprovechar el Player Graph local en memoria para enriquecer la interfaz con lazos sociales inmediatos que incrementen la confianza en la plataforma.

## 2026-07-23 - Alerta de Baja Tardía y Flexibilidad de Inicio para Creadores
**Learning:** El sistema reducía silenciosamente la reputación de asistencia de un jugador en un 5% si éste se bajaba de un turno con menos de 2 hours de anticipación, lo cual causaba frustración e incomprensión de las mecánicas de gamificación. Incorporar una advertencia proactiva en el modal de confirmación previene esto. Al mismo tiempo, restringir el inicio de un partido únicamente a cuando un turno estuviera lleno impedía a los organizadores avanzar el partido si tenían 4+ inscritos pero el turno era originalmente de 6 u 8. Habilitar dinámicamente este control si se alcanzan los 4 participantes recomendados elimina este cuello de botella y acelera el paso al juego.
**Action:** Informar siempre de forma transparente y proactiva de los impactos de reputación/gamificación en los flujos interactivos críticos antes de que el usuario los ejecute. Asegurar que las reglas de negocio de elegibilidad (como el inicio del partido) coincidan de forma fluida con las posibilidades de juego real.

## 2026-07-24 - Unificación de Vistas y Refactorización Estética a Estándares MDS
**Learning:** Alinear las páginas del mismo flujo lógico (como la creación y la edición de turnos) no solo mejora la armonía del producto sino que simplifica la carga mental del usuario. En la página de creación (`NewTurnPage`), agrupar los controles dentro de una tarjeta con un encabezado semántico y estético (`Zap` icon + "Detalles del partido") y añadir un botón de volver idéntico al de edición elimina asimetrías de diseño. Asimismo, usar `bg-muted/50` and `border-transparent` para los botones no seleccionados (en vez de `bg-card`) provee un contraste óptimo bajo el sistema minimalista.
**Action:** Unificar siempre el layout estructural y los componentes de navegación en flujos hermanos y evitar translucidez o layouts planos inconsistentes.

## 2026-07-25 - Botón de Calendario y Reducción de Ausencias
**Learning:** Permitir que los jugadores inscriptos y los creadores agreguen sus partidos directamente a sus calendarios (como Google Calendar o iCal) sirve como un elemento de retención clave y disminuye de forma drástica las cancelaciones accidentales o bajas por olvido. Para respetar el Minimal Design System (MDS), la implementación debe ser 100% nativa en el navegador, sin servicios externos que ralenticen el renderizado, utilizando componentes con estados de expansión sólidos (`bg-muted`), botones táctiles con `active:scale-[0.98]` y etiquetas de accesibilidad en español.
**Action:** Buscar siempre integrar herramientas de utilidad inmediata en el contexto donde el usuario toma decisiones críticas (ej: debajo de la información del turno, no aislado).

## 2026-07-26 - Filtro Interactivo de Turnos "Todos" vs "Mis Turnos"
**Learning:** Permitir que los usuarios tengan acceso inmediato a los turnos en los que están anotados (ya sea como organizador, jugador o suplente) a través de una pestaña dedicada evita que tengan que buscar en un tablero lleno. Al mantener el componente principal de la página como un componente estático de Next.js App Router, logramos retener las ventajas del Partial Prerendering (PPR) de Next.js 15, delegando la interactividad y filtrado del lado del cliente de forma fluida e instantánea, usando botones accesibles con roles semánticos y sin necesidad de realizar viajes redondos al servidor.
**Action:** Emplear filtros interactivos del lado del cliente cuando el conjunto de datos sea acotado para brindar una experiencia libre de latencia, respetando siempre el marcado ARIA para tecnologías de asistencia.

## 2026-07-27 - Botones de Acción Interactivos en Detalle de Turno con Estados de Carga
**Learning:** Los formularios de Server Actions del lado del servidor puros no brindan retroalimentación visual al usuario durante su procesamiento, lo que resulta en una experiencia lenta en conexiones lentas y el riesgo de dobles envíos accidentales. El uso de componentes cliente interactivos impulsados por `useTransition` and un botón estilizado MDS estándar proporciona una transición perfecta a estados de carga dinámicos y deshabilitados, mejorando drásticamente el flujo interactivo de alta fidelidad sin afectar la renderización estática (PPR).
**Action:** Convertir los botones y formularios críticos de interacción directa (bajas, altas, inicios de partido) en componentes del lado del cliente rápidos con estados de transición pendientes.

## 2026-07-28 - Estandarización de Filtros Sólidos y Cooldown en Tarjetas de Turno
**Learning:** Pasar `lastNetworkNotificationAt` al componente `TurnCard` permite que los botones internos de salvage calculen y reflejen de manera proactiva el cooldown de 1 hora del lado del cliente, mejorando enormemente la experiencia del usuario sin forzarlo a ingresar a cada turno individual para verificar su estado. Reemplazar estilos translúcidos (`hover:bg-card/40`) por sólidos (`hover:bg-card`) garantiza el cumplimiento absoluto del Minimal Design System (MDS).
**Action:** En cualquier listado interactivo, priorizar el traspaso de timestamps de cooldown a los componentes hijos y emplear siempre hover sólido bajo el MDS.

## 2026-07-30 - Barra de Progreso de Turnos y CTA Contextual de Invitación para Cupos Vacíos
**Learning:** Agregar una barra de progreso visual de cupos ocupados vs cupos totales en la tarjeta de información del turno permite a los jugadores comprender instantáneamente el estado de completitud del turno de manera sumamente visual. A su vez, colocar un CTA contextual de invitación (icono de compartir) en los cupos vacíos cuando el espectador es un participant (creador o jugador) facilita increíblemente que ellos mismos tomen la iniciativa de invitar a amigos para salvar el partido, todo con estilos 100% sólidos de acuerdo al Minimal Design System (MDS).
**Action:** Maximizar siempre el use de indicadores visuales sólidos y claros y CTAs altamente contextuales para impulsar la completitud y el salvage de turnos sin sobrecargar la interfaz.

## 2026-07-31 - Spanish Dynamic Turn Notification Relative Date Formatting
**Learning:** Los destinatarios de notificaciones de turnos carecían del contexto sobre qué día se jugaría el turno (ej: veían "Cupo abierto en tu red: Club · 19hs"), lo que causaba confusión sobre si era hoy, mañana o un día posterior. La implementación de un helper robusto de fechas relativas adaptado al dialecto argentino (`getTurnLabelWithDate`) brinda un contexto inmediato y de alta fidelidad directamente en la bandeja de notificaciones.
**Action:** Incluir siempre contextos temporales de fecha relativa clara y localizada en los envíos de notificaciones transaccionales para guiar al usuario a la toma rápida de decisiones.
## 2026-08-11 - Turn Chat with Ephemeral Upstash Redis Storage and System Bot
**Learning:** Designing chat storage using an ephemeral key-value/LIST mechanism in `@upstash/redis` with 90-day auto-expiry provides extremely high scalability without the need for relational database tables. To make this rock-solid for serverless on Vercel where long-lived WebSockets are unstable, using standard HTTP/Rest-based polling (e.g. 5-second interval) is an extremely resilient and performant solution. Furthermore, adding high-fidelity, realistic localized mock data under bypass mode guarantees perfect offline builds and E2E visual Playwright verification. Finally, when integrating scrollable features on views with a sticky fixed bottom bar, introducing a dedicated container margin or bottom height spacer (e.g., `h-64`) is essential to prevent interactive elements from being visually or functionally intercepted.
**Action:** Always employ high-fidelity mock fallbacks in store wrappers to facilitate visual test compilation and execution. Ensure scrollable list elements on mobile viewports include proper spacing/padding to avoid collision or overlap with fixed-positioned action menus.
