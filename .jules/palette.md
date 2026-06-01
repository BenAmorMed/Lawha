## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-06-01 - [Accessible Rating and Avoiding Nested Interactions]
**Learning:** Purely visual components like star ratings can be noisy for screen readers if not grouped correctly. Additionally, nesting a `Button` inside a `Link` is invalid HTML and confuses assistive technologies, as both are interactive elements.
**Action:** Use `role="img"` and `aria-label` on rating containers to provide a summary of the value, and hide individual stars with `aria-hidden="true"`. Never nest interactive elements; style the `Link` component directly to look like a button instead.
