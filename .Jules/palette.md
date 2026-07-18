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
