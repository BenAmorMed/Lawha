## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-04-13 - [Standardized Loading Feedback and Rating Accessibility]
**Learning:** Core form actions (Login, Register, Reviews) often lack visual feedback during async operations, leading to user uncertainty and double-submissions. Additionally, custom interactive elements like star ratings are frequently implemented as simple buttons without communicating their state (value/pressed) to assistive technologies.
**Action:** Standardize async feedback by integrating a `Spinner` into the shared `Button` component via an `isLoading` prop. When using `Link` components as buttons, ensure they also respect disabled/loading states via `pointer-events-none` and `aria-disabled`. For rating interactions, use `aria-label` (e.g., "Rate 3 out of 5 stars") and `aria-pressed` to ensure accessibility.
