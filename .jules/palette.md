## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-03-31 - [Form Accessibility and Feedback]
**Learning:** Rating inputs using just symbols (like stars) lack semantic meaning and keyboard accessibility if not properly wrapped in a `radiogroup` with labels. Furthermore, long text inputs benefit from visible character counts linked via `aria-describedby` to provide context to screen reader users.
**Action:** Implement rating systems as semantic `radiogroup` components with `aria-label` per star, and always associate character counts with their respective inputs using `aria-describedby` for enhanced form UX.
