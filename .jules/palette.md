## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-06-03 - [Semantic Rating Component]
**Learning:** Rating components that use icons (like stars) are often invisible to screen readers or announced as a series of redundant "star" images.
**Action:** Use a descriptive `aria-label` on the rating container (e.g., "Rated 4.5 out of 5 stars") and apply `aria-hidden="true"` to the decorative icon container to provide a clear, concise summary for assistive technologies.
