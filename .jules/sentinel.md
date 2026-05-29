## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-05-29 - [SQL Injection in AdminService.getAllOrders]
**Vulnerability:** The `orderBy()` method in TypeORM QueryBuilder was used with unsanitized user input via string interpolation (`order.${sortBy}`), allowing for SQL injection.
**Learning:** TypeORM's `orderBy()` does not automatically escape or parameterize column names. While values in `where()` are safe when using parameters, column names in `orderBy()` are often passed directly to the SQL query.
**Prevention:** Implement strict whitelisting for any dynamic column names or sort directions used in `orderBy()`. Ensure only allowed property names and 'ASC'/'DESC' strings reach the database layer.
