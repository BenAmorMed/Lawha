## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-04-07 - [Denial of Service (DoS) in Base64 Image Upload]
**Vulnerability:** The `POST /api/v1/images/upload-preview` endpoint accepted arbitrary-sized base64-encoded `dataUrl` strings without validation, risking memory exhaustion and DoS.
**Learning:** Public endpoints processing base64 data require both request-level (DTO) and buffer-level (post-decoding) size limits, as base64 overhead can bypass naive character count checks.
**Prevention:** Implement `MaxLength` validation in DTOs for data URLs and explicitly check decoded `buffer.length` before storage operations. Sanitize 500-level error messages to prevent leaking storage infrastructure details.
