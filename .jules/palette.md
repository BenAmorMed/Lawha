## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-07-02 - [Branding and Discoverability Patterns]
**Learning:** Hardcoded "blue" color classes were used in specific features (Reviews), diverging from the pink design system (#D91E63). Additionally, hiding interactive features (like forms) behind authentication without a clear CTA reduces discoverability and user engagement.
**Action:** Use primary design system tokens for all interactive feedback and replace conditional rendering of "Auth-only" features with informative "Sign In" CTAs to guide unauthenticated users.
