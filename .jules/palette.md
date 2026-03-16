## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2025-05-20 - [Accessible and Precise Rating Component]
**Learning:** The initial `Rating` component lacked screen reader support and only displayed full stars, providing a less precise and inaccessible experience for high-traffic product grids.
**Action:** Use `role="img"` and a descriptive `aria-label` on rating containers. Combine numerical ratings and review counts into the label for a single, clear announcement. Implement `StarHalf` with rounding logic (0.25–0.75 threshold) to provide better visual feedback for non-integer ratings.
