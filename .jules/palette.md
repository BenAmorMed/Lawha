## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-03-23 - [Accessible Half-Star Rating Pattern]
**Learning:** For high-fidelity rating displays, stacking a `StarHalf` icon over an empty `Star` background using absolute positioning provides a more polished and consistent visual than simple rounding or clipping. Using thresholds (0.25/0.75) for rounding to half/full stars aligns better with user expectations for visual representation of decimal ratings.
**Action:** Use the `Rating` component's layered star approach and descriptive `aria-label` (including review counts) for all product and review displays. Ensure interactive star buttons in forms have explicit 'Rate X stars' labels for screen readers.
