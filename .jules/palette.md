## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2025-05-15 - [Testing Transient UI States]
**Learning:** Standard automated UI verification (like Playwright) can easily miss transient states like loading spinners if the backend or mock response is too fast, leading to false negatives in verification.
**Action:** Use request interception (e.g., `page.route` in Playwright) to artificially delay network responses when verifying loading indicators or progress states.
