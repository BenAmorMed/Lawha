## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-05-24 - [SQL Injection in Administrative Order Listing]
**Vulnerability:** The `AdminService.getAllOrders` method used unsanitized user input from `sortBy` and `sortOrder` query parameters directly in a TypeORM `orderBy` clause via string interpolation.
**Learning:** TypeORM's `orderBy` method does not automatically parameterize or escape column names. Passing raw user input into this method allows for SQL injection by manipulating the query structure.
**Prevention:** Always implement a strict whitelist for column names and sort directions in `orderBy` clauses. Validate user input against this whitelist before passing it to the QueryBuilder.

## 2026-05-24 - [Hardcoded JWT Secret Fallback]
**Vulnerability:** `AuthModule` and `JwtStrategy` included a hardcoded fallback string `'your_jwt_secret_key_change_in_production'` if the `JWT_SECRET` environment variable was missing.
**Learning:** Hardcoded secrets in code, even as fallbacks, are a significant security risk as they are often left in production environments and can be easily discovered by attackers.
**Prevention:** Remove hardcoded secrets and fallbacks. Ensure the application fails to start (fails fast) if critical security configuration like `JWT_SECRET` is missing, forcing proper environment setup.
