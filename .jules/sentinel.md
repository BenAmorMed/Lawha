## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-04-15 - [SQL Injection in Admin Sorting & Inconsistent Status Validation]
**Vulnerability:** The `AdminService.getAllOrders` method interpolated `sortBy` and `sortOrder` directly into the query, creating a SQL injection risk. Additionally, the `OrderStatus` enum was missing the `REFUNDED` status used in logic, and status updates used hardcoded strings and generic errors.
**Learning:** Even within `createQueryBuilder`, direct interpolation of user-provided keys in `orderBy` can bypass TypeORM's parameterization, especially if those keys aren't matched against entity properties.
**Prevention:** Always whitelist dynamic query parameters like `sortBy` and `sortOrder`. Use enums for status validation and ensure they are exhaustive and synchronized across entities and services. Throw specific HTTP exceptions (e.g., `BadRequestException`) instead of generic `Error` objects to ensure secure and informative API responses.
