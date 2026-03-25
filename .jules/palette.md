## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2025-05-16 - [Half-Star Rating Support & Accessibility]
**Learning:** Average ratings (e.g., 4.5) were previously rounded to integers in the UI, leading to misleading visual representation of product quality. Additionally, rating displays lacked semantic meaning for screen readers. Stacking a `StarHalf` icon over a background `Star` icon using absolute positioning provides a visually balanced half-star without creating asymmetry.
**Action:** Use the shared `Rating` component for all rating displays to ensure consistency, half-star support, and proper accessibility (role="img" + aria-label).
