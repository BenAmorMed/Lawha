## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-06-02 - [Review System UX and Accessibility]
**Learning:** Ad-hoc implementations of interactive star ratings often miss critical ARIA roles (radiogroup/radio) and keyboard focus states. Additionally, generic UI patterns (like blue "Sign In" buttons) can dilute brand identity if they don't use the established primary palette.
**Action:** Ensure all interactive ratings use proper ARIA radiogroup patterns and that unauthenticated CTAs are fully integrated into the app's brand colors (primary pink in this case).
