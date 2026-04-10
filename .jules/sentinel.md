## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-04-10 - [SQL Injection in OrderBy Clause]
**Vulnerability:** The `AdminService.getAllOrders` method passed raw user input from the `sortBy` query parameter directly into TypeORM's `orderBy()` method, which does not automatically parameterize column names, allowing for SQL injection.
**Learning:** While TypeORM handles parameterization for `where` clauses, `orderBy` and other dynamic query parts often require manual whitelisting or sanitization when they involve dynamic column names.
**Prevention:** Always use an explicit whitelist for dynamic sort fields and validate sort order (ASC/DESC) before passing them to the query builder.

## 2026-04-10 - [Information Leakage in Storage Errors]
**Vulnerability:** `ImagesService.uploadToMinIO` was returning raw error messages from the MinIO client directly to the API response, potentially exposing infrastructure details like bucket names or internal endpoints.
**Learning:** Low-level library errors should be caught and logged internally, while the client should only receive a generic, safe error message.
**Prevention:** Wrap external service calls in try-catch blocks and throw generic `InternalServerErrorException` without including the raw `error.message` in the response.
