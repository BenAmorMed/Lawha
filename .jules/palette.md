## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-07-05 - [Review System Accessibility & Branding]
**Learning:** For dynamic components like reviews, simply adding ARIA labels isn't enough; they must explicitly include dynamic data (like helpful counts) to ensure screen reader users receive updates. Furthermore, interactive star ratings need both descriptive labels ("Rate X stars") and focus-visible indicators to be truly accessible to keyboard users.
**Action:** Use `aria-live='polite'` on loading states, incorporate descriptive `aria-label` attributes that include current dynamic values for buttons, and ensure all custom interactive elements (like stars) have clear `focus-visible` styles and are mapped to design system color tokens.
