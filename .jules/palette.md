## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2025-05-16 - [Accessible Rating Selection & Improved Feedback]
**Learning:** Rating selection via raw characters (★) is inaccessible to screen readers and difficult to style consistently. Using a `radiogroup` with descriptive `aria-label` and `aria-live` regions provides immediate feedback for assistive technologies. Additionally, ensuring all form fields have explicit `htmlFor` and `id` associations is critical for both accessibility and automated testing (e.g., Playwright's `get_by_label`).
**Action:** Use semantic `radiogroup` for rating inputs and ensure all form fields are correctly labeled and linked.
