## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2025-05-22 - [Accessible Rating component with half-star support]
**Learning:** The `Rating` component was previously limited to whole stars and lacked semantic ARIA labels. For better visual clarity and accessibility, stacking a `StarHalf` icon over an empty background `Star` icon (using absolute positioning) maintains the full star shape while accurately representing fractional ratings. Additionally, using a dynamic `aria-label` that matches the visual rounding logic ensures a consistent experience for screen reader users.
**Action:** Implement a shared `Rating` component with half-star support (using threshold-based rounding) and comprehensive accessibility attributes (`role="img"`, `aria-label` with pluralization).
