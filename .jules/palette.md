## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2025-05-16 - [Consolidated Rating Logic and Enhanced Feedback]
**Learning:** Multiple versions of "star rendering" logic across the app led to inconsistent UI and a rounding bug in the display of average ratings. Consolidating this into a shared `Rating` component ensures a single source of truth and uniform accessibility attributes.
**Action:** Centralize repeated UI logic into atomic components like `Rating` and use `aria-live` regions for dynamic form feedback (e.g., character counts) to improve screen reader experience.
