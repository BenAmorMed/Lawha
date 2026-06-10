## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-06-10 - [Button asChild Pattern for Semantic Links]
**Learning:** Nesting a functional UI component like `Button` inside a Next.js `Link` (which renders as an `<a>`) causes invalid HTML (`<button>` inside `<a>`). This breaks accessibility and can lead to unexpected browser behavior.
**Action:** Implement the `asChild` pattern in base UI components using `React.cloneElement`. This allows the component to pass its styles and accessibility props to a single child element (like a Link), ensuring semantic HTML while maintaining consistent styling.
