## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2025-05-22 - [Centralized Rating and Half-Star Accessibility]
**Learning:** Redundant rating rendering logic across multiple pages led to inconsistent visual styles and missing accessibility features. Implementing a centralized `Rating` component with `role="img"` and dynamic `aria-label` ensures all star ratings are accessible to screen readers and visually consistent.
**Action:** Consolidate repeated UI patterns into shared components and always include descriptive ARIA labels that translate visual data (like stars) into meaningful text for assistive technologies.
