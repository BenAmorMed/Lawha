## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2025-05-16 - [Accessible Rating Component and Filter Improvements]
**Learning:** The `Rating` component was previously inaccessible to screen readers and lacked visual precision for fractional ratings. Additionally, input fields and close buttons in the product filtering UI were missing descriptive labels.
**Action:** Implement `role="img"` and descriptive `aria-label` on rating components while using `aria-hidden="true"` for decorative icons. Use `StarHalf` from `lucide-react` for more accurate visual representation of ratings. Always provide `aria-label` for icon-only buttons and input fields without visible labels.
