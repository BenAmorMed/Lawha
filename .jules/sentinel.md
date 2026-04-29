## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-04-29 - [SQL Injection in Dynamic Sorting & Info Leakage]
**Vulnerability:** The `AdminService.getAllOrders` endpoint allowed un-sanitized string input into the `.orderBy()` clause via template literals, enabling SQL injection. Additionally, `ImagesService` leaked raw MinIO error messages to the client.
**Learning:** TypeScript type unions for query parameters are NOT enforced at runtime by NestJS. Manual whitelisting of dynamic database identifiers (columns, sort directions) is mandatory when using TypeORM's query builder. Detailed error messages from storage providers can expose bucket names or internal IP addresses.
**Prevention:** Always implement an `allowedFields.includes(input)` check before passing dynamic values to `.orderBy()`. Use generic "Internal Server Error" messages for client-facing exceptions while keeping detailed logs on the server.
