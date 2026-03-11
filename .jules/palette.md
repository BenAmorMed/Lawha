## 2025-05-15 - [Accessibility and Interaction Enhancements]
**Learning:** Icon-only interactive elements (search, social links, cart) in the layout were missing `aria-label` attributes, making them inaccessible to screen readers. Additionally, the base `Button` component lacked focus-visible indicators, which is a common barrier for keyboard-only navigation.
**Action:** Always ensure icon-only buttons have descriptive `aria-label` attributes and maintain a global `Button` component that includes `focus-visible` ring styles and clear `disabled` state feedback.

## 2025-05-15 - [Rating System Accessibility and Visual Polish]
**Learning:** Hardcoded star-rendering logic using unicode characters (★) often lacks accessibility support and visual fidelity for fractional ratings. Centralizing rating logic into a dedicated component allows for consistent half-star rendering and standardized ARIA labeling (e.g., "Rating: 4.5 out of 5 stars").
**Action:** Use a dedicated `Rating` component for all star-based displays and implement threshold-based half-star logic (< 0.25 floor, 0.25-0.75 half, >= 0.75 ceil) to provide accurate visual feedback for product averages.
