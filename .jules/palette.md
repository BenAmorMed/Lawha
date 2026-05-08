## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2025-05-16 - [Reviews List Accessibility and Consistency]
**Learning:** The `ReviewsList` component was missing ARIA roles for its loading state (`status`) and rating distribution bars (`progressbar`). It also used a custom star rendering instead of the shared `Rating` component, leading to visual inconsistency.
**Action:** Leverage shared UI components for consistency and always include appropriate ARIA roles and descriptive labels for non-text status indicators.
