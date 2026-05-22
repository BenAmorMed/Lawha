## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-05-22 - [Enhanced Review System UX and Accessibility]
**Learning:** Hiding interactive forms (like reviews) from unauthenticated users creates a "dead end" in the UX. Showing a branded "Sign In" call-to-action instead provides a clear path forward and maintains the page's visual structure. Additionally, interactive star ratings benefit significantly from a `hoverRating` state to provide immediate visual feedback before selection.
**Action:** Always provide a clear call-to-action for restricted interactive elements instead of hiding them. Implement hover previews for multi-state selection components like star ratings.
