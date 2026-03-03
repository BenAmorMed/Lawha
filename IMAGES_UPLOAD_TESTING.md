# Image Upload - Testing Guide

## Endpoints Created

```
POST   /api/v1/images/upload       → Upload image with DPI validation
GET    /api/v1/images              → Get user's uploaded images
GET    /api/v1/images/:id          → Get image metadata and print quality
DELETE /api/v1/images/:id          → Delete image (soft delete)
```

## Features

✅ File upload with multipart/form-data
✅ DPI validation (minimum 150, recommended 300)
✅ File type validation (JPEG, PNG, WebP, TIFF)
✅ File size limit (50MB max)
✅ Image metadata extraction (dimensions, colorspace)
✅ Thumbnail generation (200x200px)
✅ MinIO (S3-compatible) storage integration
✅ Print quality assessment
✅ User image isolation
✅ Soft delete support

## Test Commands (Once Docker is Working)

### Step 1: Get Auth Token

First, register and login to get a JWT token:

```bash
# Register
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "full_name": "Test User"
  }'

# Login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

Save the `access_token` from login response.

### Step 2: Upload Image

```bash
curl -X POST http://localhost:4000/api/v1/images/upload?dpi=300 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/image.jpg"
```

**Expected Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "original_filename": "my-image.jpg",
  "mime_type": "image/jpeg",
  "file_size": 2048576,
  "width": 3000,
  "height": 2000,
  "dpi": 300,
  "s3_url": "http://minio:9000/canvas-platform/1708365600000-abc123-my-image.jpg",
  "s3_thumbnail_url": "http://minio:9000/canvas-platform/thumbnails/1708365600000-abc123-my-image.jpg",
  "created_at": "2026-02-19T10:00:00.000Z"
}
```

### Step 3: Get Your Uploaded Images

```bash
curl -X GET http://localhost:4000/api/v1/images \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "original_filename": "my-image.jpg",
    "width": 3000,
    "height": 2000,
    "dpi": 300,
    "s3_thumbnail_url": "http://minio:9000/canvas-platform/thumbnails/...",
    "file_size": 2048576,
    "created_at": "2026-02-19T10:00:00.000Z"
  }
]
```

### Step 4: Get Image Metadata & Print Quality

```bash
curl -X GET http://localhost:4000/api/v1/images/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "original_filename": "my-image.jpg",
  "dimensions": {
    "width": 3000,
    "height": 2000
  },
  "dpi": 300,
  "file_size": 2048576,
  "mime_type": "image/jpeg",
  "is_printable": true,
  "print_quality": "excellent",
  "recommendations": []
}
```

### Step 5: Upload Low-DPI Image (Test Validation)

```bash
curl -X POST http://localhost:4000/api/v1/images/upload?dpi=100 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/image.jpg"
```

**Expected Error (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Minimum DPI for printing is 150"
}
```

### Step 6: Delete Image

```bash
curl -X DELETE http://localhost:4000/api/v1/images/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response (204 No Content)**

## DPI Quality Assessment

The service automatically evaluates print quality:

| DPI Range | Quality | Recommendation |
|-----------|---------|-----------------|
| < 150 | Not printable | Increase DPI before printing |
| 150-299 | Acceptable | Use for basic prints |
| 300+ | Excellent | Perfect for high-quality prints |

## Supported File Types

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- TIFF (.tiff, .tif)

## File Size Limits

- Maximum: 50MB per file
- Recommended: Under 10MB for faster uploads

## Files Created

**Backend:**
- `src/images/image.entity.ts` - Image storage metadata entity
- `src/images/images.dto.ts` - DTOs for API responses
- `src/images/images.service.ts` - File upload, validation, and metadata
- `src/images/images.controller.ts` - REST endpoints
- `src/images/images.module.ts` - Module with TypeORM

**Frontend:**
- `src/api/images-api.ts` - Images API client with types
- `src/store/imagesStore.ts` - Zustand store for image state

## Key Features

✅ JWT-protected endpoints (requires authentication)
✅ Automatic thumbnail generation
✅ DPI validation for print quality
✅ Detailed metadata extraction
✅ MinIO/S3 integration ready
✅ Image type and size validation
✅ User image isolation
✅ Print quality recommendations

## Next Feature

After Image Upload is tested, the next feature is:
- 📝 **Orders** - Order checkout, management, and tracking

