## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-05-19 - [SQL Injection in dynamic OrderBy]
**Vulnerability:** TypeORM's `orderBy()` method accepts raw strings and does not automatically parameterize or escape column names when using template literals (e.g., `.orderBy(`order.${sortBy}`, sortOrder)`). Unsanitized user input in these parameters allowed for potential SQL injection.
**Learning:** Even with an ORM, dynamic identifiers (column names, table names, sort directions) must be explicitly whitelisted because they are typically interpolated directly into the SQL statement rather than being sent as parameters.
**Prevention:** Always implement a strict whitelist of allowed column names for sorting and validate the sort direction (ASC/DESC) before passing them to the QueryBuilder's `orderBy` method.
