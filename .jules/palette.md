## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-04-24 - [Standardizing Loading States and Rating Accessibility]
**Learning:** Implementing a reusable `Spinner` integrated into a base `Button` component ensures consistent visual feedback across the application. For star ratings, using native buttons with descriptive `aria-label` attributes (e.g., "Rate 3 stars") significantly improves accessibility compared to simple icon clicks.
**Action:** Use the enhanced `Button` with `isLoading` for all asynchronous form submissions and always provide `aria-label` for non-textual interactive elements like rating stars.
