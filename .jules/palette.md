## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-07-21 - [Rating and Review Accessibility & Branding]
**Learning:** For visual-heavy data like star ratings, providing a summary `aria-label` on the container while marking child stars and text as `aria-hidden="true"` creates a much cleaner screen reader experience. Additionally, always showing form entry points (like `ReviewForm`) even to unauthenticated users—by replacing "hidden" states with branded "Sign In" calls-to-action—improves feature discoverability and keeps the UI consistent.
**Action:** Implement container-level `aria-label` for Rating components and use branded `bg-pink-50` prompts for unauthenticated feature access.
