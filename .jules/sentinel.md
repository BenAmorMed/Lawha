## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-03-10 - [SQL Injection via Order By Clause in Admin Dashboard]
**Vulnerability:** The `getAllOrders` endpoint in `AdminService` directly interpolated `sortBy` and `sortOrder` query parameters into a TypeORM `.orderBy()` clause without validation, allowing potential SQL injection.
**Learning:** Even when a security pattern (whitelisting) is implemented in one method of a service (e.g., `getAllReviews`), it can be easily overlooked in adjacent methods (`getAllOrders`) during rapid development or refactoring.
**Prevention:** Audit all endpoints that accept dynamic sorting or filtering parameters. Centralize sorting logic or use a consistent whitelisting utility/pattern across the entire service layer.
