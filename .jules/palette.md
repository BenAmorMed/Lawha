## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-04-29 - [Improving Form Interactivity and Accessibility]
**Learning:** Star rating buttons and form submit buttons often lack immediate feedback or clear accessibility descriptors. Using a polymorphic `Button` component that supports `isLoading` states ensures consistent UX for async actions. Additionally, star ratings need conditional pluralization in `aria-label` (e.g., "1 star" vs "2 stars") for better screen reader clarity.
**Action:** Implement polymorphic `Button` components that handle both `Link` and `button` types, and always use conditional logic for pluralizing ARIA labels in repetitive interactive elements like star ratings.
