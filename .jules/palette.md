## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-05-01 - [Semantic Rating Components]
**Learning:** Display-only rating components (like stars on a product card) should be treated as single images by screen readers to avoid announcing each star individually. Interactive rating forms require both descriptive labels for each option and clear focus indicators to be truly keyboard-accessible.
**Action:** Use role="img" with a combined aria-label for static ratings, and ensure star buttons in forms have explicit aria-labels and focus-visible ring styles.
