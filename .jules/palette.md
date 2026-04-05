## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2026-04-05 - [Precise and Accessible Rating Components]
**Learning:** Visual-only rating components (stars) are inaccessible to screen readers if they lack a descriptive `aria-label`. Furthermore, using integer-only rounding for ratings (e.g., 3.8 becoming 4.0) can be misleading; implementing half-star rendering with specific thresholds (0.25/0.75) provides much more accurate feedback. Stacking `StarHalf` over an empty `Star` maintains the full star shape while visually representing the fraction.
**Action:** Implement the `Rating` component with half-star logic using the 0.25/0.75 thresholds and include a comprehensive `aria-label` that accounts for both the score and the total reviews count.
