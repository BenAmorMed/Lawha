## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-05-05 - [Accessible Ratings and Interactive Loading States]
**Learning:** Rating components often lack semantic meaning for screen readers. Using `role="img"` with a descriptive `aria-label` on the container while hiding decorative stars via `aria-hidden="true"` provides a much better experience. For interactive ratings, providing per-star `aria-label` and `focus-visible` rings is essential for keyboard accessibility. Additionally, generic buttons should support an `isLoading` state to prevent double-submissions and provide immediate feedback.
**Action:** Use the `role="img"` pattern for read-only ratings and ensure all icon-only interactive elements (like star buttons) have descriptive labels and clear focus indicators.
