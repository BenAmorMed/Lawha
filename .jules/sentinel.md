## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-05-17 - [SQL Injection in TypeORM orderBy]
**Vulnerability:** The `orderBy()` method in TypeORM QueryBuilder does not automatically parameterize or escape column names; using unsanitized user input via string interpolation in `orderBy` leads to SQL injection risks.
**Learning:** Developers often assume that all QueryBuilder methods are inherently safe from SQL injection, but `orderBy` (and some others like `groupBy`) are frequently excluded from automatic parameterization due to how SQL engines handle identifiers.
**Prevention:** Implement manual whitelisting for all dynamic sort fields and directions. Validate that the provided `sortBy` field exists in the allowed list and that the `sortOrder` is strictly 'ASC' or 'DESC' before applying them to the query.
