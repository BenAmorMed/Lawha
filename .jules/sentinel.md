## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-03-10 - [Price Manipulation and Cross-Order Payment Confirmation]
**Vulnerability:** The payment intent creation endpoint trusted the client-provided `amount`, allowing users to pay less than the order total. Additionally, the payment confirmation endpoint didn't verify if the `paymentIntent` metadata matched the `orderId` or the expected amount, potentially allowing one payment to confirm a different, more expensive order.
**Learning:** Never trust client-side prices or totals. All financial calculations must be re-verified against the database at the point of transaction. Payment intents should be validated against their original purpose (order ID and exact amount) during confirmation to prevent replay or cross-order attacks.
**Prevention:** Derieve payment amounts exclusively from the database. Implement strict metadata and amount matching during payment confirmation.
