## 2025-05-31 - [Form Accessibility Elevation]
**Learning:** Custom selection groups (like level or duration selectors implemented with buttons) are often opaque to screen readers. Using `role="radiogroup"` and `role="radio"` with `aria-checked` provides the necessary semantic structure for assistive technologies.
**Action:** Always wrap custom button-based selectors in a container with `role="radiogroup"` and assign `role="radio"` and `aria-checked` to individual items. Combine with `aria-required="true"` on mandatory inputs for full programmatic clarity.

## 2025-06-01 - [Placeholder Readability and Typography]
**Learning:** High-impact micro-typography (black weight, uppercase, wide tracking) on input fields severely degrades the readability of placeholders, especially when they follow sentence case. Removing these decorative styles from form inputs improves accessibility and immediate user orientation.
**Action:** In Minimal Design refactors, ensure that `Input` components used for search or data entry have standard typography weights and normal letter-spacing to prioritize the legibility of placeholders and user input.

## 2025-06-02 - [Design System Constraints as UX North Star]
**Learning:** In systems prioritizing clarity (like Padel Red's Minimal Design), standard "delight" features such as entry animations and backdrop blurs are explicitly listed as anti-patterns. True UX excellence in these contexts means removing visual noise to meet accessibility maxims (e.g., removing text below 11px).
**Action:** Prioritize `DESIGN.md` maxims over generic UX "best practices" when they conflict. Removing prohibited flourishes is as much a "Palette" win as adding ARIA labels.

## 2026-07-09 - [Accessible Semantic Indicators]
**Learning:** Decorative status indicators like "recent form" dots are often omitted from the accessibility tree. Wrapping them in a container with a descriptive, localized `aria-label` (e.g., "Forma reciente: G, G, P") while hiding the individual dots ensures the information is communicated to all users without redundant noise.
**Action:** When implementing visual status summaries, always provide a high-level programmatic description for assistive technologies and use semantic colors (emerald/rose) for high-contrast clarity.

## 2025-06-03 - [EmptyState Standardization and Keyboard Accessibility]
**Learning:** Shared components like `EmptyState` should strictly follow `DESIGN.md` even when they were initially implemented with non-compliant patterns (like translucent backgrounds or larger fonts). Keyboard accessibility on custom interactive elements (buttons acting as radios) requires explicit `focus-visible:ring-2` to be usable for non-mouse users.
**Action:** When refactoring for MDS, prioritize `DESIGN.md` maxims for shared components and always audit custom interactive elements for `focus-visible` states.

## 2026-07-18 - [Custom Dialog Accessibility and Focus Trap Standards]
**Learning:** Custom overlay dialogs implemented with standard HTML elements (rather than semantic dialog tags or headless libraries) lack default keyboard and pointer handlers. Explicitly managing keydown events (Escape to close), backdrop click target verification (`e.target === e.currentTarget`), and programmatic focus redirection (using dynamic refs and small setTimeout buffers) are essential to prevent trapping non-mouse users.
**Action:** When introducing or auditing custom dialog overlays, verify that pointer backdrops, keyboard escape controls, and target element autofocusing are natively handled and verified.

## 2026-07-19 - [Custom Button Keyboard Focus Indicators]
**Learning:** Custom selection or list buttons (such as those for marking player attendance or selection options inside modals) often lack focus rings because they aren't standard `<input>` or default styled buttons. Applying Tailwind's `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background` ensures keyboard-only users can navigate through custom forms and options without visual blindness.
**Action:** Always include high-visibility `focus-visible` ring styles on any custom `<button>` elements representing form fields, option controls, or item selections.

## 2026-07-20 - [Standardizing Interactive Banners and Custom Dismiss Actions]
**Learning:** Highly prominent user-onboarding banners (like PWA installation, push notification prompts, and biometric/passkey enrollment cards) should maintain visual homogeneity and strict solid-background compliance under the Minimal Design System (MDS). Furthermore, raw custom `<button>` tags and close buttons inside these alerts are frequently omitted from keyboard focus paths, making them inaccessible.
**Action:** Replace raw button controls inside banners with standard theme buttons (e.g., standard `Button` with variant `ghost` or custom components with high-visibility `focus-visible` outline rings) and assign solid card layout classes (`bg-card border-border`) to ensure full compliance and complete screen reader coverage with localized Spanish ARIA labels.

## 2026-07-21 - [Semantic Form Control Keyboard Focus & ARIA Indicators]
**Learning:** Custom interactive button groups acting as radio selectors (e.g. score, duration, player count buttons) must have high-visibility focus states (`focus-visible:ring-2`) and proper interactive state indicators (`aria-pressed` or `aria-checked` and Spanish labels where appropriate) so keyboard and screen reader users can navigate and understand them effortlessly.
**Action:** Always include high-visibility focus indicator rings on any interactive buttons representing selection options, and supply explicit `aria-pressed` or `aria-checked` states for clear programmatical announcement.

## 2026-07-24 - [Accessible Notification Badge Label Pluralization]
**Learning:** Generic labels like "Notificaciones" on badge counters do not convey critical contextual numerical details to screen reader users. Dynamic, localized, pluralization-aware ARIA labels (e.g. "1 notificación pendiente" vs. "3 notificaciones pendientes") significantly enhance the programmatic accessibility of count elements.
**Action:** When implementing any counter badges (messages, notifications, unread items), always ensure the `aria-label` dynamically reflects both the count and pluralization rules in the user's preferred locale.

## 2026-07-25 - [MDS Selector Button Tactile Scaling and Touch Target Sizing]
**Learning:** In highly customized choice forms (such as duration, format, sets, and score selectors), standard button elements often feel sterile without tactile scaling animations. Ensuring custom buttons have a minimum height of `h-12` (48px) for optimal touch target sizing and adding `transition-all active:scale-[0.98]` animations drastically improves form delight and usability on mobile devices.
**Action:** When building or modifying custom selection controls (e.g., radiogroups or button-based choices), enforce `h-12` heights and incorporate `transition-all active:scale-[0.98]` tactile states.

## 2026-07-26 - [Profile Form Micro-UX & Keyboard Access]
**Learning:** Adding a real-time character counter (`{alias.length}/30`) with screen reader `aria-live="polite"` feedback on inputs provides clear user orientation on mobile-first applications. Additionally, raw button controls (like Google photo restore and remove photo actions) are often omitted from the keyboard focus path unless explicitly given high-visibility focus indicator rings (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1`).
**Action:** Always provide screen-reader-friendly character counters for constrained inputs and ensure raw button tags are styled with standard design system focus outlines.

## 2026-07-26 - [Custom Selector Keyboard Accessibility]
**Learning:** Custom interactive selectors, such as recent clubs selector buttons inside wizards or step forms, require standard high-visibility keyboard focus rings so non-mouse/keyboard-only navigators can immediately perceive their location and selection state.
**Action:** Always include high-visibility focus indicator rings (`focus-visible:ring-2`) on custom buttons acting as selection list options.

## 2026-07-27 - [Brand Identity Cognitive Micro-UX Pattern]
**Learning:** In minimal design environments, branding elements on critical entry points (like identity provider/OAuth sign-in buttons) can feel sterile without immediate cognitive visual cues. Incorporating highly-recognizable brand-compliant vector graphics inline (e.g., Google's multi-colored G logo) next to the action label, while keeping it visually separate from screen-reader flows with `aria-hidden="true"`, maximizes accessibility and user confidence.
**Action:** Always provide standard vector brand indicators next to label texts on external sign-in portals, and ensure they are cleanly hidden from the accessibility tree to avoid unnecessary screen-reader clutter.

## 2026-08-01 - [Quick Action Accessibility & MDS Solid Hover States]
**Learning:** Raw quick-action button elements (such as the quick-join and quick-confirm actions) are often forgotten when styling outline focus rings and tactile transitions, hindering keyboard-only user navigation. Furthermore, interactive selector hover states can inadvertently introduce semi-transparent backgrounds (e.g. `hover:bg-card/40`), violating Minimal Design System (MDS) solids-only constraints.
**Action:** Always verify that quick-action `<button>` elements contain high-visibility focus states (`focus-visible:ring-2`) and responsive tactile scaling (`active:scale-[0.98]`). When styling hover properties in custom lists or filters, prioritize solid values (like `hover:bg-card`) over translucent alpha channels to preserve readability and contrast.

## 2026-08-02 - [Card and List Hover Solidity & Tactile Scaling]
**Learning:** List item and card links frequently default to semi-transparent hover states (e.g., `hover:bg-muted/50`), which dilutes visual clarity and contrast across pages. Replacing these with solid classes (like `hover:bg-muted`) enforces the MDS Translucency Prohibition. When combined with tactile scaling transitions (`active:scale-[0.98] transition-all`), this provides exceptional touch feedback on mobile devices.
**Action:** Replace any semi-transparent hover backgrounds on interactive card links with solid colors and integrate tactile scaling to elevate interactive responsiveness.
## 2026-08-02 - [Interactive Graph Controls Keyboard Accessibility & MDS Solids]
**Learning:** Interactive controls rendered over dynamic canvases (like network graphs or interactive maps) often omit keyboard navigation focus highlights because they are placed in floating panels or raw button tags (e.g. "Centrar" button or "×" text button). Furthermore, filter chips or selection controls frequently fall back to translucent backgrounds (e.g., `bg-card/50`), violating the Minimal Design System's Translucency Prohibition. Using focus-within highlighting on input wrappers, replacing character-based text closures (like "×") with semantic Lucide SVG icons, and ensuring solid background fallback values (like `bg-muted`) on choice elements provides complete keyboard navigation support and clean readability.
**Action:** Always use solid background colors for both active and inactive choice controls to avoid translucent styles. Ensure all floating canvas overlays have explicit, high-visibility focus rings and utilize semantic Lucide SVG icons for raw text control buttons with transition-all tactile feedback.

## 2026-08-03 - [Accessible Form Textarea Counters & Null Safety]
**Learning:** Adding real-time character constraints and counters on optional `<textarea>` fields (such as notes or additional descriptions) sets clear user expectations. However, to prevent runtime pointer crashes, counters must safely retrieve string lengths using nullish fallbacks (e.g., `(formData.notes ?? "").length`). Furthermore, using `aria-live="polite"` on fields updated by standard keyboard typing causes high-frequency screen-reader announcements on every single keystroke.
**Action:** Always safeguard counter properties with nullish coalescing or optional chaining to support null fields loaded from databases, and avoid `aria-live` attributes on counters that change on every keystroke to prevent accessibility audio spam.

## 2026-08-04 - [Next.js Build-Time Environment Variable Inlining & Robust Mock Session Bypasses]
**Learning:** Next.js bakes environment variables (non-`NEXT_PUBLIC` prefixed ones) as static constants during the production build `next build`, meaning code blocks with `process.env.AUTH_BYPASS === "true"` can get evaluated and compiled away to `false` at build-time. For bulletproof offline/mock runtime query bypasses that don't rely on compile-time environment variables in separate context boundaries like Server Actions, checking dynamic session attributes such as `session.user.id === "p-01"` provides completely reliable runtime isolation.
**Action:** When implementing offline mock bypasses inside Next.js Server Actions or queries, check both the environment flag and the dynamically evaluated active mock session credentials (e.g. mock user ID) to guarantee complete runtime query redirection.
