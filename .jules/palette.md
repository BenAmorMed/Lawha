## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-07-21 - [Star Rating Accessibility Pattern]
**Learning:** Star ratings were being announced as five separate characters or stars by screen readers, creating noise. Providing a summary `aria-label` on the container while using `aria-hidden="true"` on the individual stars creates a much cleaner experience.
**Action:** For visual data representations like ratings, use a container with `role="img"` and a summary `aria-label`, hiding the decorative icons from screen readers.
