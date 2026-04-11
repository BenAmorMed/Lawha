## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2025-05-16 - [Half-star Rating Accessibility]
**Learning:** For rating components, providing a single `aria-label` on the container (e.g., "4.5 out of 5 stars, 124 reviews") is much more readable for screen readers than five individual icon labels. Visually, stacking a StarHalf icon over an empty Star background is necessary to maintain a consistent full-star silhouette when displaying fractional ratings.
**Action:** Use a descriptive, aggregate `aria-label` for rating components and utilize absolute positioning for StarHalf overlays to ensure visual consistency.
