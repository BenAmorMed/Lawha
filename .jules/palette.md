## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2025-05-16 - [Smooth Scroll Utility and Performance]
**Learning:** Adding global scroll-based utilities (like "Scroll to Top") requires throttling the scroll listener to prevent excessive re-renders and potential performance degradation on lower-end devices. Using modern standards like `window.scrollY` instead of `window.pageYOffset` is preferred for long-term maintainability.
**Action:** Implement a 100ms throttle for any new scroll-bound logic and use `window.scrollTo` with `behavior: 'smooth'` for a polished user experience.
