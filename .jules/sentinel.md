## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-04-20 - [SQL Injection in Admin Order Sorting]
**Vulnerability:** The `AdminService.getAllOrders` method was vulnerable to SQL injection because it directly concatenated the `sortBy` and `sortOrder` query parameters into the `orderBy()` clause of a TypeORM query builder.
**Learning:** Even when using an ORM like TypeORM, some methods like `.orderBy()` might not automatically parameterize their arguments if they are used to specify column names or keywords. TypeScript type unions in DTOs or query parameters are not enforced at runtime by NestJS unless specific decorators are used, allowing malicious strings to reach the service.
**Prevention:** Always implement a manual whitelist for dynamic sorting parameters (`sortBy`, `sortOrder`) in the service layer before passing them to the ORM. Use safe defaults when the input doesn't match the expected values.
