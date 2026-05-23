## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2025-05-16 - [Component Polymorphism and Interactive Feedback]
**Learning:** The `Button` component lacked flexibility to be used as a wrapper for links (e.g., Next.js `Link` or `a`), leading to inconsistent styling when trying to make a link look like a button. Furthermore, the `ReviewForm` rating system was purely text-based and lacked hover states, which reduced the perceived quality and usability of the form.
**Action:** Implement the `asChild` pattern in core UI components to allow polymorphic rendering while maintaining design system consistency. Use a `hoverRating` state in interactive inputs to provide immediate visual feedback before selection.
