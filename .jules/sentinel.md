## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-06-22 - [Insecure Hardcoded Secret Fallbacks]
**Vulnerability:** Critical secrets like `JWT_SECRET`, `DB_PASSWORD`, and `MINIO_SECRET_KEY` had hardcoded default values in the source code (e.g., 'canvas_secret', 'minioadmin123').
**Learning:** Using fallbacks in `configService.get('KEY', 'fallback')` is a common convenience for local dev that creates a "fail-open" security risk in production if the environment variable is missing.
**Prevention:** Always use `configService.getOrThrow('KEY')` for sensitive credentials. This enforces a "fail-fast" behavior, ensuring the application cannot start in an insecure state.

## 2026-06-22 - [Missing Security Headers]
**Vulnerability:** The application lacked basic security headers (CSP, HSTS, Clickjacking protection), making it more susceptible to common web-based attacks.
**Learning:** Standard NestJS/Express boilerplates do not include these protections by default.
**Prevention:** Integrate `helmet` middleware as a global requirement in `main.ts` for all production-ready applications.
