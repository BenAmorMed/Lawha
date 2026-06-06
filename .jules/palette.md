## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-05-20 - [Enhanced Form Accessibility and Visual Feedback]
**Learning:** Guest users are more likely to engage with review sections when presented with a clear, branded call-to-action (CTA) rather than being hidden behind a conditional render. Additionally, interactive rating systems benefit significantly from immediate hover feedback and ARIA radio roles to signal state to screen readers.
**Action:** Always render interactive areas for guest users using branded sign-in prompts, and ensure star ratings utilize `role="radiogroup"` with `hoverRating` states for superior micro-UX.
