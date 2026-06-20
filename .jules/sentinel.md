## 2026-03-08 - [Insecure Direct Object Reference (IDOR) in Orders]
**Vulnerability:** The `GET /api/v1/orders/:id` endpoint lacked ownership verification, allowing any user to view sensitive order data (shipping details, items) by guessing or obtaining a UUID.
**Learning:** Routes that support both guest and authenticated users often miss proper `req.user` population, leading to bypassed ownership checks in services when they rely on an optional `userId` parameter.
**Prevention:** Use an `OptionalJwtAuthGuard` to consistently populate `req.user` even on public-facing routes, and explicitly check if an object has a `userId` before allowing access without a matching authenticated ID. Use `NotFoundException` (404) for access denial to avoid leaking resource existence.

## 2026-03-09 - [Insecure Direct Object Reference (IDOR) in Images]
**Vulnerability:** The `GET /api/v1/images/:id` (metadata) endpoint was public and lacked ownership verification, allowing any user to view image metadata (dimensions, DPI, quality) by ID.
**Learning:** Security logic must be consistent across all CRUD operations. While `deleteImage` had ownership checks, the metadata endpoint was overlooked.
**Prevention:** Ensure all endpoints that retrieve or modify user-owned resources include ownership verification. Propagate `userId` to services even for public-facing "metadata" or "status" routes using `OptionalJwtAuthGuard`.

## 2026-06-20 - [Hardcoded Secrets and Insecure Defaults]
**Vulnerability:** The application used hardcoded fallback values for critical secrets (, , ) in several modules. If environment variables were missing, it would silently fall back to well-known defaults like 'canvas_secret'.
**Learning:** Using `configService.get(key, fallback)` for sensitive data is a security anti-pattern as it risks running in production with insecure credentials if the environment is misconfigured.
**Prevention:** Always use `configService.getOrThrow(key)` for secrets to ensure the application fails fast and securely during initialization if mandatory security configuration is absent.

## 2026-06-20 - [Hardcoded Secrets and Insecure Defaults]
**Vulnerability:** The application used hardcoded fallback values for critical secrets (`JWT_SECRET`, `DB_PASSWORD`, `MINIO_SECRET_KEY`) in several modules. If environment variables were missing, it would silently fall back to well-known defaults like 'canvas_secret'.
**Learning:** Using `configService.get(key, fallback)` for sensitive data is a security anti-pattern as it risks running in production with insecure credentials if the environment is misconfigured.
**Prevention:** Always use `configService.getOrThrow(key)` for secrets to ensure the application fails fast and securely during initialization if mandatory security configuration is absent.
