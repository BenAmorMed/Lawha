## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-04-08 - [DoS and File Type Vulnerability in Preview Uploads]
**Vulnerability:** The `POST /api/v1/images/upload-preview` endpoint accepted arbitrary `dataUrl` strings without validation, exposing the server to Denial of Service (DoS) via massive payloads and potential storage of malicious files.
**Learning:** Public endpoints accepting base64 data must have strict length limits at the DTO level and buffer size checks after decoding, as base64 encoding increases payload size by ~33%.
**Prevention:** Always use DTOs with `@MaxLength` for base64 inputs and implement secondary buffer length and MIME type validation in the service layer before processing or storing the file.
