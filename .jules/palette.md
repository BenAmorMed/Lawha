## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-05-07 - [Component Consistency and ARIA Roles]
**Learning:** Reusing the `Rating` component ensures accessible star rendering across the app. For custom UI elements like rating distribution bars and loading states, explicitly adding `role="progressbar"` and `role="status"` with descriptive `aria-label` attributes is critical for providing context to screen reader users in this specific design system.
**Action:** Always prefer shared UI components for domain-specific data (like ratings) and implement ARIA roles/labels for all custom-styled status indicators.
