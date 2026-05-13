## 2026-05-12 - [Improve Match Result UX and Accessibility]
**Learning:** Standardizing loading states and non-blocking notifications improves the perceived performance and professional feel of a mobile-first PWA. Adding semantic accessibility attributes like inputMode="numeric" is crucial for mobile user experience on numeric inputs.
**Action:** Always prefer themed loaders over plain text, use toasts instead of alerts, and ensure all inputs have proper mobile-friendly attributes and ARIA labels.

## 2025-05-13 - [Public UI Test Routes for Authenticated Components]
**Learning:** In applications where most routes are protected by OAuth (e.g., Google Login), visual verification of UI components can be blocked during development/CI. Creating a public /test-ui route to mount specific components with mock data enables consistent visual testing and faster feedback loops.
**Action:** Use public test routes to verify accessibility and UX of protected components without needing a full authentication bypass or real credentials.
