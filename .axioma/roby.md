## 📋 BACKLOG
- [ ] Implement a personalized greeting variation based on the user's selected level or play style if added post-MVP.

## ✅ DONE
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
