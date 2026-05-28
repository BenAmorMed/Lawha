## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.
## 2026-05-20 - [Review Form Accessibility and Interactivity]
**Learning:** Standard HTML form inputs without explicit 'id' and 'htmlFor' associations are a major accessibility barrier for screen reader users. Additionally, providing immediate visual feedback through hover states in rating systems significantly improves perceived responsiveness and user delight.
**Action:** Always link labels to inputs using 'id' and 'htmlFor' and implement interactive hover states for multi-option selection components like star ratings.
