## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2025-05-15 - [Unified Loading States]
**Learning:** Consolidating async feedback (loading spinners) into a base UI component like `Button` significantly reduces code duplication and ensures a consistent user experience across different forms (Login, Register, Reviews).
**Action:** Prefer extending base UI components with standard interaction states (loading, disabled, error) instead of implementing local state handling in every form.
