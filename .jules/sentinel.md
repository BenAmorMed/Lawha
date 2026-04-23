## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-04-23 - [SQL Injection in Order Sorting]
**Vulnerability:** The `GET /api/v1/admin/orders` endpoint allowed arbitrary strings to be passed into TypeORM's `.orderBy()` clause via the `sortBy` and `sortOrder` query parameters.
**Learning:** NestJS TypeScript type unions for query parameters (e.g., `sortBy?: 'createdAt' | 'total'`) are not enforced at runtime. TypeORM's `orderBy` method does not always escape column names as they are not typically parameterized in SQL.
**Prevention:** Always implement manual whitelisting for any dynamic sorting or grouping parameters in services. Validate that `sortBy` belongs to a known set of columns and `sortOrder` is strictly 'ASC' or 'DESC'.
