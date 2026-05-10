## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2025-05-20 - [Contextual Authentication CTAs]
**Learning:** Completely hiding interactive features (like review forms) from unauthenticated users creates a "dead end" in the UX. Providing a branded, contextual "Sign In" call-to-action within the feature's natural location significantly improves discoverability and user flow compared to simple conditional rendering in parent pages.
**Action:** Instead of wrapping feature components in `user && ...` checks in page layouts, pass the auth state to the component and render a high-quality "Sign In" placeholder to maintain layout consistency and guide guest users.
