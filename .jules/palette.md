## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-07-06 - [Standardizing Review Form Accessibility and Branding]
**Learning:** Hardcoded generic colors (like blue-500) and unlinked form labels are common UX debt in rapidly developed features. In this app, the 'primary' pink token and 'pink-50' background provide a consistent brand identity that was missing in the reviews section. Additionally, star ratings require 'role="group"' and 'aria-label' for clear screen reader navigation.
**Action:** Replace hardcoded blue utility classes with design system tokens and ensure all star-rating interfaces include descriptive ARIA labels and group roles.
