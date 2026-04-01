## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2025-05-16 - [Consolidating UI Logic and Accessibility]
**Learning:** Localized UI helpers (like `renderStars`) often bypass shared accessibility features implemented in global components. Refactoring these into shared components not only ensures visual consistency but also guarantees that accessibility improvements (like `aria-label` and `role="img"`) are applied universally.
**Action:** Identify and refactor redundant UI rendering logic into shared components to ensure consistent accessibility standards across the application.
