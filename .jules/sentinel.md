## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-06-13 - [SQL Injection Risk in Dynamic Ordering]
**Vulnerability:** The `AdminService.getAllOrders` method used template literals to pass the `sortBy` parameter directly into TypeORM's `.orderBy()`, which does not automatically parameterize column names.
**Learning:** Even with TypeORM, dynamic column names in `orderBy` or `groupBy` are not safe from injection unless strictly whitelisted at runtime.
**Prevention:** Always implement a hardcoded whitelist of allowed columns for any dynamic sorting or grouping logic. Use `configService.getOrThrow()` for critical security configurations like `JWT_SECRET` to ensure the application fails fast if they are missing.
