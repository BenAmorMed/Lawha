## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2025-05-16 - [Precise and Accessible Rating Displays]
**Learning:** Standard star ratings often lack the precision to represent fractional scores accurately, and screen readers can struggle with the visual-only nature of star icons.
**Action:** Implement the `Rating` component using `role="img"` and a descriptive `aria-label` for screen readers. Use the `StarHalf` icon and specific thresholds for visual precision: `< 0.25` is floor, `0.25–0.75` is half-star, and `>= 0.75` rounds up to a full star.
