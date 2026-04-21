## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-04-21 - [SQL Injection in Dynamic Sorting]
**Vulnerability:** The `AdminService.getAllOrders` method used raw input from `sortBy` and `sortOrder` in `.orderBy()`, which TypeORM does not automatically sanitize when passed as a string template.
**Learning:** TypeScript type unions for query parameters are not enforced at runtime by NestJS. Attackers can bypass these types via query string manipulation to inject SQL fragments into `.orderBy()`.
**Prevention:** Always implement explicit runtime whitelisting (e.g., `allowedFields.includes(sortBy)`) and strict value checking for `sortOrder` before passing them to `.orderBy()`.

## 2026-04-21 - [DoS in Base64 Image Processing]
**Vulnerability:** `ImagesService.uploadPreview` accepted arbitrary-sized `dataUrl` strings and converted them to `Buffer` without validation, posing a memory-exhaustion DoS risk.
**Learning:** Standard file upload decorators (like `@UseInterceptors(FileInterceptor(...))`) provide size limits, but custom `dataUrl` processing endpoints often bypass these protections.
**Prevention:** Manually validate the length of `dataUrl` strings or the resulting `Buffer` size before performing intensive operations like image processing or storage.
