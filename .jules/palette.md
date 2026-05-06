## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-05-06 - [Product Rating and Review UI Improvements]
**Learning:** Using raw unicode characters like '★' for rating inputs provides a poor user experience as they lack hover/focus states and are difficult to style consistently. Additionally, async submission buttons without loading indicators can lead to double-submissions and user frustration.
**Action:** Use accessible icon libraries (like Lucide) for rating inputs with explicit `aria-label` and `focus-visible` rings. Always implement `isLoading` states in core `Button` components to provide immediate visual feedback during network requests.
