## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-06-09 - [SQL Injection in Dynamic OrderBy Clauses]
**Vulnerability:** The `AdminService.getAllOrders` method used template literals to inject the `sortBy` parameter directly into TypeORM's `orderBy()` clause, allowing for potential SQL injection since column names are not automatically parameterized.
**Learning:** Even with an ORM like TypeORM, certain methods like `orderBy` or `where` (when using raw strings) do not provide automatic protection for identifier names (columns/tables). Whitelisting is mandatory for any dynamic identifier.
**Prevention:** Always implement a strict allow-list for any user-provided input that determines column names or sort directions in database queries.
