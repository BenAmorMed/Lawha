## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-06-01 - [Semantic HTML and Accessible Link Components]
**Learning:** Nesting interactive elements like `<button>` inside `<Link>` tags (or any `<a>` tag) is a semantic HTML violation and causes issues for assistive technologies. Modern link components should be capable of assuming the visual style of a button while maintaining the correct semantic tag.
**Action:** Enhance shared button components to support an `href` prop that renders the component as an `<a>` tag (or framework-specific `Link`) with proper attribute spreading, avoiding nested interactive elements.
