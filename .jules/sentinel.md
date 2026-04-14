## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-04-14 - [SQL Injection Risk in Admin Order Sorting]
**Vulnerability:** The `AdminService.getAllOrders` method directly interpolated user-provided `sortBy` and `sortOrder` parameters into a TypeORM `orderBy` clause, potentially allowing SQL injection if the driver or query builder didn't provide sufficient escaping for those specific identifiers.
**Learning:** Even when using an ORM's query builder, dynamic identifiers (column names, sort directions) are often not parameterized in the same way as values, making them a common vector for injection.
**Prevention:** Always use a whitelist approach for dynamic identifiers. Validate that user-provided column names and sort orders exactly match a predefined set of safe values before passing them to the query builder.
