## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-05-23 - [SQL Injection in TypeORM OrderBy]
**Vulnerability:** The `AdminService.getAllOrders` method used string interpolation in the `orderBy` clause of TypeORM's QueryBuilder, allowing arbitrary SQL injection via unsanitized user input in the `sortBy` and `sortOrder` parameters.
**Learning:** TypeORM's `orderBy` method does not automatically parameterize or escape column/alias names when passed as a string, unlike `where` clauses which use placeholders.
**Prevention:** Always implement a strict runtime whitelist for dynamic column names and sort orders before passing them to `orderBy`. Use manual validation in services to ensure only allowed strings reach the query builder.
