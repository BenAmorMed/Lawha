## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2025-05-24 - [Accessible Star Ratings and Half-Star Precision]
**Learning:** Rating components are often rendered as purely visual elements, but they provide critical information that must be communicated via `role="img"` and a dynamic `aria-label`. For visual polish, using absolute positioning for half-stars (stacking a filled half-star over an empty star) provides a cleaner and more consistent star shape than overflow-based hacks.
**Action:** When implementing rating systems, always include a text summary for screen readers (e.g., "4.5 out of 5 stars") and ensure interactive rating buttons in forms use `aria-label` and `aria-pressed` to indicate selection.
