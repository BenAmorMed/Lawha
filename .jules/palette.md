## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-04-14 - Enhanced Rating Component Accessibility and Precision
**Learning:** For rating components with fractional values, providing a descriptive `aria-label` (e.g., "Rating: 4.5 out of 5 stars based on 124 reviews") on the container with `role="img"` is more effective than labeling individual stars. Additionally, visual precision for half-stars can be achieved using a clipped container (`overflow-hidden` and `w-1/2`) to overlay a filled star on an empty background, which maintains the icon's shape better than using different icons for half-states.
**Action:** Always include `role="img"` and a combined `aria-label` for rating displays, and use the clipping technique for consistent half-star rendering across the design system.
