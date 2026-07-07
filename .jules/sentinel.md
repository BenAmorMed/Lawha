## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-07-07 - [SQL Injection in Admin Order Sorting]
**Vulnerability:** The `AdminService.getAllOrders` method directly interpolated the `sortBy` and `sortOrder` query parameters into a TypeORM `orderBy` clause, allowing for potential SQL injection or Order-By injection.
**Learning:** Even when using a QueryBuilder, dynamic sorting fields must be whitelisted because they are often not parameterized by ORMs in the same way as `WHERE` clause values.
**Prevention:** Always use a whitelist of allowed field names and sort directions for any dynamic sorting logic. Default to a safe field (like `createdAt`) if the input does not match the whitelist.
