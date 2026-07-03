## 2025-05-20 - Elevated Toast UI for V9 High-Fidelity
**Learning:** Toasts in a "bubble aesthetic" design system should move away from standard rectangular cards and adopt the same glassmorphism (`backdrop-blur-2xl`) and rounded corners (`rounded-[2rem]`) as the main UI. Using `role="status"` and `aria-live="polite"` is essential for non-intrusive but accessible feedback.
**Action:** Always implement `aria-live` regions for dynamic feedback and use staggered entrance animations (`animate-in`) to provide a premium feel without overwhelming the user.

## 2025-05-21 - Global Tactile Feedback Strategy
**Learning:** Centralizing tactile feedback (like `active:scale-[0.98]`) in the base `Button` component significantly improves UI consistency and reduces CSS noise. Using `transition-all` ensures that both color and transform transitions are handled smoothly during user interaction.
**Action:** Always check the base UI components for interactive states before adding manual overrides in view components to maintain a DRY and consistent design system.
