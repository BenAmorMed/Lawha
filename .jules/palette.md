## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-06-12 - [Semantic Nesting and Prop Forwarding]
**Learning:** Nesting interactive elements like `<button>` inside `<Link>` is semantically invalid and can cause unexpected behavior with screen readers and focus management. When refactoring components to handle multiple underlying tags (e.g., button vs. anchor), it's critical to forward all relevant props while filtering out those that are invalid for the target tag (like `type` on an anchor).
**Action:** Use a unified `Button` component that accepts an `href` prop to switch its underlying implementation, ensuring proper prop spreading and ARIA attribute maintenance.
