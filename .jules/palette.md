## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2025-05-22 - [Standardizing Rating UI and Accessibility]
**Learning:** Scatter-shot implementations of star ratings (e.g., local `renderStars` functions) lead to inconsistent UI and poor accessibility. Screen readers often miss these visual-only cues if not explicitly labeled.
**Action:** Centralize rating logic into a single `Rating` component with `role="img"`, a descriptive `aria-label` for aggregate stats, and visual support for half-stars (using absolute positioning to overlay icons) to provide high-fidelity feedback.
