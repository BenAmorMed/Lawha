# Products API - Testing Guide

## Endpoints Created

```
GET  /api/v1/products             → List all products
GET  /api/v1/products/:id         → Get product details with sizes and frames
GET  /api/v1/products/templates/all → Get all design templates
```

## Test Commands (Once Docker is Working)

### Test 1: Get All Products
```bash
curl http://localhost:4000/api/v1/products
```

**Expected Response:**
```json
[
  {
    "id": "product-1",
    "name": "Canvas Print",
    "category": "canvas",
    "base_price": 25.99,
    "image_url": "https://example.com/canvas.jpg",
    "is_active": true
  },
  {
    "id": "product-2",
    "name": "Poster Print",
    "category": "poster",
    "base_price": 12.99,
    "image_url": "https://example.com/poster.jpg",
    "is_active": true
  },
  {
    "id": "product-3",
    "name": "Acrylic Print",
    "category": "acrylic",
    "base_price": 34.99,
    "image_url": "https://example.com/acrylic.jpg",
    "is_active": true
  }
]
```

### Test 2: Get Single Product with Details
```bash
curl http://localhost:4000/api/v1/products/product-1
```

**Expected Response:**
```json
{
  "id": "product-1",
  "name": "Canvas Print",
  "description": "Premium canvas printing on high-quality canvas",
  "base_price": 25.99,
  "category": "canvas",
  "image_url": "https://example.com/canvas.jpg",
  "is_active": true,
  "created_at": "2026-02-19T10:00:00.000Z",
  "sizes": [
    {
      "id": "size-1",
      "product_id": "product-1",
      "name": "Small",
      "dimensions": "8x10 inches",
      "price_modifier": 0
    },
    {
      "id": "size-2",
      "product_id": "product-1",
      "name": "Medium",
      "dimensions": "12x16 inches",
      "price_modifier": 25
    },
    {
      "id": "size-3",
      "product_id": "product-1",
      "name": "Large",
      "dimensions": "16x20 inches",
      "price_modifier": 50
    }
  ],
  "frame_options": [
    {
      "id": "frame-1",
      "name": "No Frame",
      "description": "Without frame",
      "price_modifier": 0
    },
    {
      "id": "frame-2",
      "name": "Black Frame",
      "description": "Modern black wooden frame",
      "price_modifier": 25
    },
    {
      "id": "frame-3",
      "name": "White Frame",
      "description": "Clean white wooden frame",
      "price_modifier": 25
    },
    {
      "id": "frame-4",
      "name": "Gold Frame",
      "description": "Elegant gold metal frame",
      "price_modifier": 40
    }
  ]
}
```

### Test 3: Get All Templates
```bash
curl http://localhost:4000/api/v1/products/templates/all
```

**Expected Response:**
```json
[
  {
    "id": "template-1",
    "name": "Modern Minimalist",
    "description": "Clean and simple design template",
    "category": "modern",
    "preview_url": "/templates/modern-minimalist.jpg",
    "definition": {
      "width": 800,
      "height": 600,
      "layers": [
        {
          "id": "background",
          "type": "rect",
          "x": 0,
          "y": 0,
          "width": 800,
          "height": 600,
          "fill": "#FFFFFF"
        }
      ]
    },
    "created_at": "2026-02-19T10:00:00.000Z"
  },
  ...
]
```

## Files Created

**Backend:**
- `src/products/product.entity.ts` - Product entity
- `src/products/products.dto.ts` - DTOs for API responses
- `src/products/products.service.ts` - Business logic
- `src/products/products.controller.ts` - REST endpoints
- `src/products/products.module.ts` - Module definition
- `src/orders/order.entity.ts` - Order entity
- `src/orders/order-item.entity.ts` - OrderItem entity

**Frontend:**
- `src/api/products-api.ts` - Products API client
- `src/store/productsStore.ts` - Zustand store for products

## Seeded Data Included

✅ 3 Products (Canvas, Poster, Acrylic)
✅ Product Sizes (Small, Medium, Large with pricing)
✅ Frame Options (No Frame, Black, White, Gold)
✅ 3 Design Templates (Modern, Vibrant, Professional)

## Next Steps

1. ✅ Auth Module - Complete and tested
2. ✅ Products API - Built and ready
3. 📝 Image Upload - Next feature (file handling, MinIO integration)
4. 📝 Orders - Order checkout and management
5. 📝 UI Components - React components for canvas editor
