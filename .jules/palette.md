## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-05-21 - [Accessible Star Rating Patterns]
**Learning:** Star rating inputs implemented as a series of buttons are often inaccessible to screen readers if they lack proper ARIA roles. Using `role="radiogroup"` on the container and `role="radio"` with `aria-checked` on the buttons provides a much better experience. Additionally, providing immediate visual feedback via `hoverRating` state improves the interactive feel for sighted users.
**Action:** When building rating components, always use ARIA radio roles and implement a hover preview state for better interactivity and accessibility.
