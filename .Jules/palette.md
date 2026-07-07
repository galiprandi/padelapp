## 2025-05-31 - [Form Accessibility Elevation]
**Learning:** Custom selection groups (like level or duration selectors implemented with buttons) are often opaque to screen readers. Using `role="radiogroup"` and `role="radio"` with `aria-checked` provides the necessary semantic structure for assistive technologies.
**Action:** Always wrap custom button-based selectors in a container with `role="radiogroup"` and assign `role="radio"` and `aria-checked` to individual items. Combine with `aria-required="true"` on mandatory inputs for full programmatic clarity.

## 2025-06-01 - [Placeholder Readability and Typography]
**Learning:** High-impact micro-typography (black weight, uppercase, wide tracking) on input fields severely degrades the readability of placeholders, especially when they follow sentence case. Removing these decorative styles from form inputs improves accessibility and immediate user orientation.
**Action:** In Minimal Design refactors, ensure that `Input` components used for search or data entry have standard typography weights and normal letter-spacing to prioritize the legibility of placeholders and user input.
