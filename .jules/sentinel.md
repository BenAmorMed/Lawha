## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-04-22 - [SQL Injection in Admin Order Sorting]
**Vulnerability:** The `AdminService.getAllOrders` method used template literals to inject `sortBy` and `sortOrder` parameters directly into the TypeORM `.orderBy()` clause, allowing potential SQL injection.
**Learning:** TypeScript type unions (e.g., `sortBy: 'createdAt' | 'total'`) are not enforced at runtime. Unsanitized input used in `.orderBy()` is a common but dangerous pattern in TypeORM that escapes standard parameterization.
**Prevention:** Always implement manual whitelisting for any dynamic database identifiers like column names or sort directions. Validate against a hardcoded list of allowed strings before passing them to the query builder.
