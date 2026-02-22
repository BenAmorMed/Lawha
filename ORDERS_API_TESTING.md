# Orders API - Testing Guide

## Endpoints Created

```
POST   /api/v1/orders                 → Create new order
GET    /api/v1/orders                 → Get user's orders
GET    /api/v1/orders/:id             → Get order details
GET    /api/v1/orders/:id/breakdown   → Get price breakdown
PATCH  /api/v1/orders/:id/status      → Update order status
DELETE /api/v1/orders/:id             → Cancel order
```

## Features

✅ Create orders with multiple items
✅ Automatic pricing calculation
✅ Order status tracking (pending → processing → printing → shipped → delivered)
✅ Tracking number management
✅ Tax calculation (8%)
✅ Free shipping over $100
✅ Order history per user
✅ Price breakdown with itemization
✅ Order cancellation (before printing)
✅ Delivery date tracking
✅ JWT-protected endpoints

## Test Commands (Once Docker is Working)

### Step 1: Get Auth Token

```bash
# Register
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "SecurePass123",
    "full_name": "John Customer"
  }'

# Login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "SecurePass123"
  }'
```

Save the `access_token` from response.

### Step 2: Create Order

```bash
curl -X POST http://localhost:4000/api/v1/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product_id": "product-1",
        "quantity": 2,
        "size_selected": "Large",
        "frame_option": "Black Frame"
      },
      {
        "product_id": "product-2",
        "quantity": 1,
        "size_selected": "A3"
      }
    ],
    "shipping_address": "123 Main St, Anytown, USA 12345"
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": "order-550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "total_amount": 76.97,
  "shipping_address": "123 Main St, Anytown, USA 12345",
  "tracking_number": null,
  "items": [
    {
      "id": "item-550e8400-e29b-41d4-a716-446655440001",
      "product_id": "product-1",
      "quantity": 2,
      "unit_price": 25.99,
      "size_selected": "Large",
      "frame_option": "Black Frame",
      "subtotal": 51.98,
      "created_at": "2026-02-19T10:00:00.000Z"
    },
    {
      "id": "item-550e8400-e29b-41d4-a716-446655440002",
      "product_id": "product-2",
      "quantity": 1,
      "unit_price": 12.99,
      "size_selected": "A3",
      "frame_option": "",
      "subtotal": 12.99,
      "created_at": "2026-02-19T10:00:00.000Z"
    }
  ],
  "created_at": "2026-02-19T10:00:00.000Z",
  "updated_at": "2026-02-19T10:00:00.000Z"
}
```

### Step 3: Get User's Orders

```bash
curl -X GET http://localhost:4000/api/v1/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
[
  {
    "id": "order-550e8400-e29b-41d4-a716-446655440000",
    "status": "pending",
    "total_amount": 76.97,
    "items_count": 2,
    "created_at": "2026-02-19T10:00:00.000Z",
    "shipped_at": null
  }
]
```

### Step 4: Get Order Details

```bash
curl -X GET http://localhost:4000/api/v1/orders/order-550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:** (Same as Step 2)

### Step 5: Get Price Breakdown

```bash
curl -X GET http://localhost:4000/api/v1/orders/order-550e8400-e29b-41d4-a716-446655440000/breakdown \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "subtotal": 64.97,
  "tax": 5.20,
  "shipping": 10.00,
  "total": 80.17,
  "items": [
    {
      "product_name": "Canvas Print",
      "quantity": 2,
      "unit_price": 25.99,
      "subtotal": 51.98
    },
    {
      "product_name": "Poster Print",
      "quantity": 1,
      "unit_price": 12.99,
      "subtotal": 12.99
    }
  ]
}
```

### Step 6: Update Order Status

```bash
curl -X PATCH http://localhost:4000/api/v1/orders/order-550e8400-e29b-41d4-a716-446655440000/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "processing",
    "tracking_number": "TRK123456789"
  }'
```

**Status Options:**
- `pending` - Order received, awaiting processing
- `processing` - Order being prepared
- `printing` - Active printing in progress
- `shipped` - Order shipped out
- `delivered` - Order delivered to customer
- `cancelled` - Order cancelled

### Step 7: Cancel Order

```bash
curl -X DELETE http://localhost:4000/api/v1/orders/order-550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response (204 No Content)**

**Note:** Orders can only be cancelled if status is `pending` or `processing`. Once printing has started, cancellation is not allowed.

## Pricing Logic

| Category | Calculation |
|----------|-------------|
| Product Base Price | From Products catalog |
| Quantity | Multiplied by unit price |
| Tax | 8% of subtotal |
| Shipping | $10 (free if subtotal > $100) |
| **Total** | Subtotal + Tax + Shipping |

## Order Status Flow

```
┌─────────┐
│ PENDING │  ← Created
└────┬────┘
     │
     ↓
┌──────────────┐
│ PROCESSING   │  ← Payment confirmed
└────┬─────────┘
     │
     ↓
┌──────────┐
│ PRINTING │  ← Active print job
└────┬─────┘
     │
     ↓
┌────────┐
│SHIPPED │  ← Tracking assigned
└────┬───┘
     │
     ↓
┌──────────┐
│DELIVERED │  ← Final state
└──────────┘

Alternative: CANCELLED (from PENDING or PROCESSING only)
```

## Files Created

**Backend:**
- `src/orders/orders.dto.ts` - Request/response DTOs
- `src/orders/orders.service.ts` - Order business logic
- `src/orders/orders.controller.ts` - REST endpoints
- `src/orders/orders.module.ts` - Module definition
- (Entities already exist: `order.entity.ts`, `order-item.entity.ts`)

**Frontend:**
- `src/api/orders-api.ts` - Orders API client with types
- `src/store/ordersStore.ts` - Zustand store for orders

## Key Features Implemented

✅ Multi-item orders support
✅ Automatic total calculation with tax & shipping
✅ Order status tracking with timestamps
✅ Tracking number management
✅ User order isolation (can't view other users' orders)
✅ Price breakdown with itemization
✅ Order cancellation with validation
✅ Free shipping threshold ($100+)

## Project Progress

1. ✅ Auth Module - Complete
2. ✅ Products API - Complete
3. ✅ Image Upload - Complete
4. ✅ Orders API - Complete
5. 📝 Frontend UI Components - Next (Canvas Editor, Product Gallery, Checkout)

## Next Steps

After Orders API is tested:
- Build React components for:
  - Product gallery & detail pages
  - Shopping cart
  - Checkout flow
  - Order history
  - Canvas editor (Konva.js integration)
