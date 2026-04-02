## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-06-15 - [Form Accessibility and Async Feedback]
**Learning:** Rating star buttons and form inputs often lack explicit ARIA roles and labels, creating barriers for screen reader users. Additionally, asynchronous form submissions without visual loading indicators (like spinners) provide poor feedback, leading to multiple clicks or user confusion.
**Action:** Use `role="radiogroup"` and `role="radio"` for star ratings with clear `aria-label`s. Ensure all form inputs have associated `<label>` elements using `id` and `htmlFor`. Implement an `isLoading` prop in the shared `Button` component to show a spinner and disable the button during async operations.
