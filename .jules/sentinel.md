## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2025-05-15 - [SQL Injection in Dynamic Ordering]
**Vulnerability:** The `AdminService.getAllOrders` method passed a user-supplied `sortBy` string directly into a TypeORM `.orderBy()` clause. Since NestJS/TypeScript type hints are erased at runtime, this allowed arbitrary SQL injection in the `ORDER BY` clause.
**Learning:** TypeORM's `QueryBuilder.orderBy()` does not automatically sanitize the column name if it's part of a template string.
**Prevention:** Always implement runtime whitelisting for dynamic sort fields and directions. Validate that the requested field exists in an allowed list before passing it to the query builder.
