## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2025-05-16 - [Loading States for Form Submissions]
**Learning:** Providing immediate visual feedback during asynchronous operations (like form submissions) via loading spinners and disabled states significantly improves perceived responsiveness and prevents duplicate submissions. Consolidating this logic into a shared `Button` component ensures consistent UX across the application and simplifies form implementation.
**Action:** For any asynchronous action triggered by a button, use a shared `Button` component that supports an `isLoading` prop to automatically handle disabling the button and showing a spinner.
