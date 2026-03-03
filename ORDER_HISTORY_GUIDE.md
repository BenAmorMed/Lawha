# Phase 6: Order History Page - Guide

## Overview

The Order History Page allows customers to view, manage, and track their canvas print orders. This guide covers the complete implementation including pagination, filtering, status tracking, and invoice management.

## Architecture

### Backend API Endpoints (Existing)

The backend already provides all necessary endpoints:

```
GET    /api/v1/orders                 - Get all user orders
GET    /api/v1/orders/:id             - Get order details
GET    /api/v1/orders/:id/breakdown   - Get pricing breakdown
PATCH  /api/v1/orders/:id/status      - Update order status
POST   /api/v1/orders                 - Create new order
DELETE /api/v1/orders/:id             - Cancel order
```

### Frontend Pages (Phase 6 Implementation)

#### 1. Order History List Page
**File:** `frontend/src/app/orders/page.tsx`

**Features:**
- Display all user orders in card layout
- Filter by status (All, Processing, Shipped, Delivered)
- Show order summary: ID, date, total, items count
- Quick actions buttons (View, Download Invoice, Reorder)
- Loading and error states
- Empty state with CTA to create order

**Key Components:**
```tsx
- OrderHistoryPage (main component)
- Filter tabs with live count
- Order cards with status badges
- Responsive grid layout
- Navigation to detail page
```

**Data Flow:**
```
Component Mount
    ↓
Check if user logged in
    ↓
Fetch orders via ordersApi.getMyOrders()
    ↓
Store in useState, filter by selected status
    ↓
Render order cards with actions
```

#### 2. Order Detail Page
**File:** `frontend/src/app/orders/[id]/page.tsx`

**Features:**
- Full order details including all items
- Status timeline with visual progress
- Tracking information (if shipped)
- Order items breakdown with pricing
- Shipping address
- Event timeline (placed, shipped, delivered dates)
- Action buttons (Download Invoice, Reorder, Contact Support)

**Key Sections:**
```
Status Timeline
├── Pending → Processing → Shipped → Delivered
├── Visual progress indicator
└── Current status highlighted

Order Items
├── Item details (size, frame, quantity)
├── Unit price and subtotal
└── Total amount with breakdown

Shipping Information
├── Address
├── Tracking number
└── Timeline of events
```

**Data Flow:**
```
Page Load with Order ID
    ↓
Check authentication
    ↓
Fetch order via ordersApi.getOrder(id)
    ↓
Display order data with status timeline
    ↓
Show action buttons based on status
```

## API Response Types

### OrderList (From getMyOrders)
```typescript
{
  id: string;
  status: string;
  total_amount: number;
  items_count: number;
  created_at: string;
  shipped_at?: string;
}
```

### Order (From getOrder)
```typescript
{
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'printing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: string;
  tracking_number: string;
  items: [
    {
      id: string;
      product_id: string;
      quantity: number;
      unit_price: number;
      size_selected: string;
      frame_option: string;
      subtotal: number;
      created_at: string;
    }
  ];
  created_at: string;
  updated_at: string;
}
```

## Status Flow

```
PENDING
  ↓ (Payment processing)
PROCESSING
  ↓ (Print worker generates PDFs)
PRINTING (internal)
  ↓ (Fulfillment team packages)
SHIPPED
  ├─ with tracking_number
  ↓
DELIVERED ─ Customer receives product

Alternative Paths:
PROCESSING → CANCELLED (No stock availability)
PROCESSING → REFUNDED (Customer requested refund)
SHIPPED → DELIVERED (normal completion)
```

## Integration Points

### 1. Navigation Links
Users should be able to access Order History from:
- Account dropdown menu
- Account/Profile settings page
- Email order confirmation
- Mobile app navigation drawer

### 2. Order Status Updates
As orders progress through fulfillment:
```
Admin Dashboard updates status
    ↓
Backend updates Order.status + Order.shipped_at
    ↓
Customer sees updated status on Order Detail page
    ↓
Email notification sent (if configured)
```

### 3. Invoice Downloading (Phase 5.2 Integration)
```
User clicks "Download Invoice"
    ↓
POST /api/v1/print/generate-invoice { orderId }
    ↓
PrintWorkerService generates PDF in background
    ↓
Job completes, stored in MinIO
    ↓
GET /api/v1/print/job/:jobId returns download URL
    ↓
Browser downloads PDF
```

## Styling & UX

### Color Scheme
- Status badges:
  - `pending`: Yellow (#FBF3C7 / #92400E)
  - `processing`: Blue (#DBEAFE / #1E40AF)
  - `shipped`: Green (#D1FAE5 / #065F46)
  - `delivered`: Green (#D1FAE5 / #065F46)
  - `cancelled`: Red (#FEE2E2 / #991B1B)
  - `refunded`: Gray (#F3F4F6 / #374151)

### Responsive Design
- **Mobile**: Single column layout, compact action buttons
- **Tablet**: Two column grid with medium buttons
- **Desktop**: Full featured layout with all details visible

### Interactive States
- Hover effects on order cards
- Loading spinners during data fetch
- Error messages with retry button
- Success notifications for actions

## Environment Variables

No new environment variables needed for Order History. Uses existing:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## Testing Checklist

### List Page Tests
- [ ] Display all user orders
- [ ] Filter by status works correctly
- [ ] Item counts update when filtering
- [ ] Click "View Details" navigates to detail page
- [ ] Click "Download Invoice" queues job (when available)
- [ ] Click "Reorder" works for delivered orders (when available)

### Detail Page Tests
- [ ] Display correct order by ID
- [ ] Status timeline shows current position
- [ ] All items display with correct pricing
- [ ] Tracking number displays when shipped
- [ ] Dates show in correct format
- [ ] Action buttons appear based on status
- [ ] Links navigate correctly

### Edge Cases
- [ ] Empty orders list shows helpful message
- [ ] Non-existent order ID shows 404
- [ ] Unauthenticated users redirect to login
- [ ] Failed API calls show error messages
- [ ] Loading states display while fetching

## Performance Optimization

### Current Implementation
- Lazy load order items on detail page
- Minimal re-renders with React hooks
- API calls cached where appropriate

### Future Enhancements
- Paginate list when many orders exist (100+)
- Virtualize long order lists
- Cache order details for 5 minutes
- Implement infinite scroll if needed
- Add search/filter by order ID

## Accessibility

### WCAG 2.1 Compliance
- ✅ Status badges with semantic colors + text labels
- ✅ Button text describes action clearly
- ✅ Loading states announced to screen readers
- ✅ Error messages focused for attention
- ✅ Link text is descriptive ("View Details")

### Keyboard Navigation
- ✅ All buttons tabbable
- ✅ Links navigable with Enter key
- ✅ Tab order logical (top to bottom)
- ✅ No keyboard traps

## Troubleshooting

### Common Issues

**"Orders not loading"**
- Check NEXT_PUBLIC_API_URL is correct
- Verify JWT token in localStorage
- Check backend is running
- Review browser console for errors

**"Cannot navigate to detail page"**
- Ensure route `[id]` folder structure is correct
- Verify useParams() is importing from next/navigation
- Check order ID is passed correctly

**"Status not updating"**
- Verify backend is updating Order.status
- Check page refresh or implement polling
- Review email notifications for updates

**"Invoice download not working"**
- Ensure PrintWorkerService is running
- Verify MinIO storage is configured
- Check job status at /print/job/:jobId
- Review backend logs for PDF generation errors

## Analytics & Tracking

### Key Metrics to Monitor
1. **Order Completion Rate**
   - Orders reaching "delivered" status
   - Time from pending to delivered

2. **User Engagement**
   - Orders viewed per user
   - Invoice download frequency
   - Reorder rate

3. **Performance**
   - API response time for order list
   - Page load time for detail page
   - Image loading time

4. **Customer Support**
   - Most common order status questions
   - Support ticket patterns related to orders
   - Tracking number inquiry frequency

## Future Enhancements (Phase 7+)

### Order History Improvements
- [ ] Full-text search by order ID or product
- [ ] Advanced filtering (date range, price range)
- [ ] Sorting options (newest first, highest price, etc.)
- [ ] Export order history to CSV
- [ ] Recurring orders / subscriptions
- [ ] Order timeline annotations

### Customer Experience
- [ ] Order notifications via SMS/Push
- [ ] Live chat integration for order questions
- [ ] Order notes/comments section
- [ ] Wishlist for future orders
- [ ] Quick reorder button with previous specs

### Admin Integration
- [ ] Admin can view any customer's order history
- [ ] Bulk status updates from admin panel
- [ ] Order review before printing
- [ ] Quality control checklist

### Business Intelligence
- [ ] Customer lifetime value calculation
- [ ] Order frequency analytics
- [ ] Product popularity by customer segment
- [ ] Refund/cancellation analysis
- [ ] Geographic order distribution

## Deployment Checklist

- [ ] Frontend pages deployed to production
- [ ] API endpoints accessible from production domain
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics integrated (Google Analytics, etc.)
- [ ] SSL certificates valid
- [ ] CORS properly configured
- [ ] Rate limiting on order endpoints
- [ ] Database indexes on order queries optimized

## Summary

The Order History Page provides a complete view of customer orders from creation through delivery. It integrates with existing order endpoints and prepares the foundation for Phase 7 Admin Dashboard and Phase 5 Print Worker features.

**Status**: ✅ PHASE 6 COMPLETE - Order History Frontend & API Integration
