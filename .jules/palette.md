## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-04-10 - [Form and Rating Accessibility]
**Learning:** Interactive star ratings and form fields lacked explicit labeling and state communication for assistive technologies. Star buttons needed `aria-label` and `aria-pressed`, while inputs required `id`/`htmlFor` pairings to be properly discoverable by screen readers and testing tools.
**Action:** Consistently use `id` and `htmlFor` for form elements and ensure custom interactive components (like ratings) use ARIA roles and attributes to describe their state and purpose.
