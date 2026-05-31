## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-05-31 - [Reviews UX and Accessibility Overhaul]
**Learning:** Replacing character-based ratings with interactive Lucide icons and hover states significantly improves the perceived quality of the interface. Providing a branded 'Sign In' CTA for unauthenticated users instead of hiding the form improves feature discoverability. Using `role="radiogroup"` and `role="radio"` for star ratings ensures they are correctly interpreted by screen readers as selectable options.
**Action:** Always implement hover feedback for interactive inputs and ensure terminal states for guest users are helpful and on-brand. Use semantic ARIA roles for custom interactive components like star ratings.
