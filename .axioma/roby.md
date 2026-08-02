## 📋 BACKLOG
- [ ] Implement a personalized greeting variation based on the user's selected level or play style if added post-MVP.

## ✅ DONE
- [x] 2026-08-02 — Profile Form initialLevel Prop Initialization Fix: Fixed a blocking compilation and build failure by correctly passing the `initialLevel` required property to the `ProfileForm` component inside `src/app/(app)/me/profile/page.tsx`. (PR #roby/profile/fix-profile-initial-level-prop)
- [x] 2026-07-31 — Stable Bypass Auth & Next.js 16 PPR Dynamic Prerendering Restoration: Standardized the session expiration to a static date and integrated asynchronous `cookies()` signaling inside `auth()`'s bypass flow to resolve Next.js 16's strict prerendering bails, enabling a seamless production build pipeline. (PR #roby/profile/stable-bypass-auth-ppr)
- [x] 2026-07-30 — Biometric Login Restoration, Back Navigation Standardization & Profile Centering Layout: Reinstated PasskeyLoginButton on the login screen, standardized magic-link back-navigation with MDS keyboard focus rings, and resolved public profile layout shifting with an absolute-positioned ShareButton. (PR #roby/profile/onboarding-ux-refinements)
- [x] 2026-07-17 — Setup inicial del agente (sistema .ants creado)
- [x] 2026-07-18 — Mejoras en Onboarding y Perfil: Onboarding prompt en /me, dual CTA en agenda vacía, descripciones de niveles de juego y selector de avatar interactivo con presets de Dicebear. (PR #1 — merged)
- [x] 2026-07-19 — Foto original de Google: Ofrecer selector para restablecer a la foto original de Google decodificando el `id_token` de la cuenta vinculada del usuario.
- [x] 2026-07-20 — Adopción completa de Cache Components (PPR) en el módulo de Perfil, Login y Onboarding. (PR #roby/profile/cache-components-onboarding)
- [x] 2026-07-21 — Compartición nativa de perfil y navegación contextualizada del perfil público. (PR #roby/profile/share-and-back-navigation)
- [x] 2026-07-22 — Estandarización de banners de onboarding y guía interactiva de instalación PWA: Rediseño accesible y adaptativo para iOS y Android siguiendo las Semantic Maxims 1.3, 2.1 y 4.3 de MDS. (PR #roby/pwa/install-onboarding-ux)
- [x] 2026-07-23 — Consolidación de onboarding en lista de preparación: Implementación del componente OnboardingChecklist en la página de inicio para nuevos usuarios. (PR #roby/profile/unified-onboarding-checklist)
- [x] 2026-07-24 — Sólidos visuales en Onboarding y Dashboard: Refactorización de fondos y bordes en checklist de onboarding, instrucciones PWA, y tarjetas de acción del Dashboard para eliminar toda semi-transparencia y cumplir plenamente las directivas de MDS. (PR #roby/profile/dashboard-solid-onboarding-polish)
- [x] 2026-07-25 — Limpieza y validación de tokens de sesión FCM en suscripción: Prevención de filtración de datos cruzados entre múltiples usuarios registrando la misma clave de dispositivo FCM en entornos compartidos. (PR #roby/profile/fcm-token-cleanup-and-validation)
- [x] 2026-07-26 — Customización y eliminación de avatar: Implementación de la opción 'Quitar foto' para limpiar la foto de perfil y volver a las iniciales del nombre de usuario, con soporte para deshacer la acción (Undo) mediante toast. (PR #roby/profile/remove-avatar-initials)
- [x] 2026-07-27 — Cumplimiento de imágenes del sistema de diseño (MDS): Reemplazo de etiquetas nativas <img> por componentes <Image> de Next.js en las páginas de landing, login e instalación. (PR #roby/pwa/standardize-image-components)
- [x] 2026-07-28 — Google Logo reinstating & Back Button Standardization: Added standard back-navigation header links to Profile and Security pages, and reinstated the Google brand logo inside OAuth SignInButton for visual micro-UX clarity. (PR #roby/profile/logo-and-back-navigation)
- [x] 2026-07-29 — Google Account Details display & Welcome Guide Restoration Setting: Enhanced the profile settings form with read-only synced account info (Name, Email) and added a dedicated control to restore the dismissed Onboarding Checklist (Welcome Guide) for new users. (PR #roby/profile/onboarding-restoration-settings)
- [x] 2026-07-30 — Biometric Login Access integration on primary Login page: Added PasskeyLoginButton to the main unauthenticated login layout under the Google OAuth connector to allow registered users to enter with Face ID / Touch ID immediately. (PR #roby/pwa/passkey-login-onboarding)

## 🧠 LEARNINGS
## 2026-08-02 - Profile Form initialLevel Prop Initialization Fix
**Learning:** When using modular, stateful form subcomponents in server component wrappers, all required properties of the client form's type interface (like `initialLevel`) must be strictly passed from the server query's payload. Omitting required props breaks TypeScript type compilation and Next.js static generation pipelines.
**Action:** Always verify client component prop requirements against server component data-feed sites, and run typescript typechecks (`pnpm tsc --noEmit`) before completing any layout refactoring.

## 2026-07-31 - Stable Bypass Auth & Next.js 16 PPR Dynamic Prerendering Restoration
**Learning:** Under Next.js 16's Partial Prerendering (PPR) compilation, any server component rendering that encounters dynamic execution (such as `new Date()`) is expected to have hit a dynamic data access first (like reading cookies or headers). When `AUTH_BYPASS === "true"` is activated, returning a purely static mock session prevents Next.js's compiler from realizing that components like `DashboardContent` are request-time dynamic, leading to unstable-value prerender failures during builds. Forcing a dynamic signal (by calling `await cookies()` inside the bypassed `auth()` function) and returning a static `expires` ISO timestamp ensures Next.js correctly defer-stream's dynamic regions at build time, restoring complete static shell compilation.
**Action:** Always pair mock/bypassed dynamic server functions with a framework-native dynamic signal (like `cookies()` or `headers()`) and static mock datestamps to keep the build pipeline 100% compliant with PPR static compilation targets.

## 2026-07-30 - Biometric Login Restoration, Back Navigation Standardization & Profile Centering Layout
**Learning:** Reinstating passkey buttons directly under OAuth options ensures that returning users can enter immediately with biometric sensors, reducing conversion leakages. In layouts where sharing buttons are placed in inline headings, using absolute positioning instead of hardcoded padding-left (like `pl-8`) ensures perfect horizontal centering on all screen sizes and prevents text wrapping from creating uneven offsets. Finally, standardizing back-navigation elements using consistent utility-class buttons across public invitation/magic-link screens is critical for keyboard accessibility and visual cohesion.
**Action:** Always prefer absolute positioning for peripheral utility icons adjacent to centered headings, and always maintain consistent back-navigation cues on all public or shareable user landing screens.
## 2026-07-30 - Biometric Login Access integration on primary Login page
**Learning:** Biometric credentials (Passkeys) provide a high-conversion, low-friction entry mechanism that completely bypasses OAuth hops. Integrating biometric entry triggers directly into primary, unauthenticated redirect contexts (like `/login?callbackUrl=...`) ensures that returning or PWA-launched users can authenticate immediately with standard device sensors (Face ID, Touch ID), greatly elevating the overall mobile and onboarding experience.
**Action:** Always make sure passkey login option is visible anywhere a standard OAuth button is offered to authenticated returnees.

## 2026-07-29 - Google Account Details display & Welcome Guide Restoration Setting
**Learning:** During the onboarding phase of new users, providing highly accessible options to reset/restore dismissed checklists (Welcome Guide) prevents information loss and significantly enhances the user's initial setup flow. Placing a dedicated reset button inside settings or profile forms solves the friction of accidental dismissals. Furthermore, displaying synced read-only properties (like Google Name/Email) under clear account cards manages users' editing expectations elegantly.
**Action:** Always provide options to restore critical discarded onboarding items in user settings pages, and present clear, read-only system-of-record markers for fields populated from OAuth providers.

## 2026-07-28 - Google Logo reinstating & Back Button Standardization
**Learning:** Reinstating highly recognizable brand elements (like Google's colorful logo icon) next to sign-in triggers enhances user trust and clarity. Additionally, adding standardized back buttons on pages deeply nested under user settings (such as /me/profile and /me/security) helps users seamlessly return to their home context and complies perfectly with Minimal Design System (MDS) navigation standards.
**Action:** Always maintain consistent back-navigation cues on settings pages to guarantee a fluid and accessible user flow.

## 2026-07-27 - Cumplimiento de imágenes del sistema de diseño (MDS)
**Learning:** Las especificaciones del Minimal Design System (§2.11 de `DESIGN.md`) exigen explícitamente el uso del componente `next/image` en lugar de las etiquetas nativas `<img>` para garantizar un rendimiento óptimo de carga y estabilidad acumulativa de diseño (CLS). Los gráficos vectoriales (SVG) deben utilizar la propiedad `unoptimized` para evitar fallos de optimización y conservar la nitidez del renderizado original.
**Action:** Evitar por completo etiquetas HTML `<img>` en cualquier componente de vista y estandarizar todos los recursos estáticos y dinámicos bajo el componente `<Image>` de Next.js.
