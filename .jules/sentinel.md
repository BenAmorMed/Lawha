## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-07-04 - [SQL Injection in Admin Order Sorting]
**Vulnerability:** The 'AdminService.getAllOrders' endpoint used unsanitized user input from query parameters directly in a TypeORM '.orderBy()' clause, allowing potential SQL injection via column names.
**Learning:** Even when using an ORM, dynamic identifiers like column names passed to 'orderBy' or 'groupBy' must be explicitly whitelisted, as they are often not automatically sanitized by the ORM's parameter binding system.
**Prevention:** Implement strict whitelisting for all dynamic database identifiers. Map user-provided strings to a set of allowed column names and validate sort direction (ASC/DESC) before constructing the query.
