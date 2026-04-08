## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-02-12 - [Unified Loading Feedback]
**Learning:** Inconsistent loading states (using "Submitting..." text vs. no feedback) create a disjointed user experience. Unifying these states into a shared `Button` component that integrates an `isLoading` prop and a `Spinner` ensures consistent visual feedback and improves accessibility by automatically handling the `disabled` state during asynchronous operations.
**Action:** Standardize on a shared UI `Button` that integrates a `Spinner` for all asynchronous actions to provide predictable feedback and prevent double-submissions.
