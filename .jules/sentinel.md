## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-05-21 - [SQL Injection in TypeORM orderBy]
**Vulnerability:** The `orderBy()` method in TypeORM QueryBuilder does not automatically parameterize or escape column names. Using unsanitized user input via string interpolation (e.g., `.orderBy(\`order.${sortBy}\`, sortOrder)`) allowed SQL injection.
**Learning:** While values in `.where()` are safe when using parameters, identifiers like column names in `.orderBy()` or `.groupBy()` are often treated as raw SQL fragments by ORMs.
**Prevention:** Always use a strict whitelist of allowed column names and sort directions before passing them to `.orderBy()`. Never trust user-provided strings for database identifiers.
