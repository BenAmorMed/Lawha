## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-05-20 - [Accessible Star Rating Pattern]
**Learning:** Standard button-based star ratings often lack semantic meaning and keyboard parity. Implementing a `role="radiogroup"` with `role="radio"` items and handling arrow key navigation (ArrowLeft/Right) provides a significantly better experience for screen reader and keyboard-only users.
**Action:** Use the `radiogroup`/`radio` pattern for all future interactive rating components, ensuring `aria-checked` and `tabIndex` are managed correctly for the selected state.
