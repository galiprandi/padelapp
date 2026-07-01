## 2025-05-20 - Elevated Toast UI for V9 High-Fidelity
**Learning:** Toasts in a "bubble aesthetic" design system should move away from standard rectangular cards and adopt the same glassmorphism (`backdrop-blur-2xl`) and rounded corners (`rounded-[2rem]`) as the main UI. Using `role="status"` and `aria-live="polite"` is essential for non-intrusive but accessible feedback.
**Action:** Always implement `aria-live` regions for dynamic feedback and use staggered entrance animations (`animate-in`) to provide a premium feel without overwhelming the user.
