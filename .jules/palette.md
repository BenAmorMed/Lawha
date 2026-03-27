## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2025-05-16 - [Review Form Accessibility and Feedback]
**Learning:** Standardizing rating components using a semantic `radiogroup` role and `aria-live` regions significantly improves the experience for screen reader users, while character counters with visual feedback prevent form submission errors for all users.
**Action:** Implement `radiogroup` for star ratings and always provide real-time character count feedback for text-heavy inputs.
