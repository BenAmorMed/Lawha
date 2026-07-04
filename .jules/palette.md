## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-07-04 - [Review Form Accessibility and Brand Consistency]
**Learning:** Wrapping a button element inside a Next.js `Link` component creates nested interactive elements, which is invalid HTML and breaks screen reader navigation. Furthermore, delegated authentication checks (showing a Sign In prompt instead of just hiding a form) significantly improve feature discoverability and user flow.
**Action:** When a Link needs to look like a button, apply the button styles directly to the `Link` or an inner span/div that is not interactive. Always use design system color tokens (`primary`, `secondary`) over hardcoded color values (`blue-500`) to ensure brand consistency.
