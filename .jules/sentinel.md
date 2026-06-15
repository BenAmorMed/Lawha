## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-06-15 - [SQL Injection in Order Sorting]
**Vulnerability:** The `AdminService.getAllOrders` method directly interpolated user-provided `sortBy` and `sortOrder` parameters into a TypeORM `.orderBy()` clause, creating a SQL injection risk.
**Learning:** TypeORM's `.orderBy()` method does not automatically parameterize or escape dynamic column names or sort directions when provided via template literals or concatenated strings.
**Prevention:** Always implement strict whitelisting for any user-provided fields used in dynamic query builders, especially for `orderBy`, `groupBy`, or column selections. Default to a safe field and order if the input does not match the whitelist.
