## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-05-25 - [Interactive Rating Feedback and Guest Visibility]
**Learning:** Hiding the review form for guest users reduces interaction potential. Displaying a branded "Sign In" call-to-action within the component maintains layout consistency and encourages user conversion. Additionally, interactive hover states on rating stars provide critical immediate feedback that raw characters cannot achieve.
**Action:** Always provide a visual preview state (like `hoverRating`) for selection inputs and use branded CTAs instead of empty states for guest access to interactive features. Ensure keyboard accessibility is maintained with `focus-visible` when using `focus:outline-none`.
