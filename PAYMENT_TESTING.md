# Payment Integration Testing Guide

## Overview
This document covers testing the complete Stripe payment integration for the Lawha platform, including order creation, payment processing, and webhook handling.

## Environment Setup

### Prerequisites
- ✅ Backend `.env` configured with Stripe test keys
- ✅ Frontend `.env` configured with Stripe public key
- ✅ Docker services running (PostgreSQL, Redis, MinIO)
- ✅ Backend running on `http://localhost:4000`
- ✅ Frontend running on `http://localhost:3000`

### Start Services
```bash
# From project root
docker-compose up -d

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start backend (development)
cd backend
npm run start:dev

# In another terminal, start frontend
cd frontend
npm run dev
```

## Manual Testing Steps

### Step 1: User Authentication
1. Navigate to `http://localhost:3000/login`
2. Sign in with existing account or register new user
3. Verify JWT token stored in browser storage
4. Confirm authentication header sent on API requests

### Step 2: Canvas Editor Workflow
1. Navigate to `http://localhost:3000/gallery`
2. Select a product (e.g., "Premium Canvas")
3. Click "Edit Design"
4. Canvas editor loads with Konva.js
5. Add/edit design elements
6. Select size (e.g., "16x20")
7. Select frame (e.g., "Gold")
8. Click "Proceed to Checkout"

### Step 3: Shipping Address Entry
1. Checkout page loads at Step 1: SHIPPING
2. Enter shipping address:
   ```
   123 Main Street
   New York, NY 10001
   USA
   ```
3. Click "Continue to Payment"
4. System creates order in database
5. Order ID stored in state
6. Page advances to Step 2: PAYMENT

**Expected Backend Behavior:**
- POST `/api/v1/orders` creates new order
- Returns order object with ID
- Order status: "pending"
- Order items linked to product

### Step 4: Stripe Payment Processing

#### Test Card Numbers
Use these Stripe test cards (valid for any future expiry and 3-digit CVC):

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/25`)
- CVC: Any 3 digits (e.g., `123`)
- Result: Payment succeeds

**Payment Declined:**
- Card: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits
- Result: Payment fails (test decline scenario)

#### Payment Flow
1. On PAYMENT step, enter email: `test@example.com`
2. Fill Stripe CardElement with test card `4242 4242 4242 4242`
3. Expiry: `12/25`
4. CVC: `123`
5. Click "Pay $XX.XX"
6. System performs:
   - POST `/api/v1/payments/create-intent` - Gets payment intent & client secret
   - `confirmCardPayment()` - Stripe redirects card processing
   - POST `/api/v1/payments/confirm` - Backend confirms payment

**Expected Backend Behavior:**
- `PaymentService.createPaymentIntent()` creates Stripe payment intent
- Amount: `subtotal + tax + shipping` (in cents)
- Metadata includes `orderId`
- Returns `client_secret` to frontend
- `confirmPaymentIntent()` retrieves payment intent from Stripe
- Returns status (succeeded/processing/failed)

### Step 5: Order Completion
1. After successful payment, page advances to Step 3: COMPLETE
2. Success message displays with order ID
3. Order ID matches database record

**Expected Backend Behavior:**
- POST `/api/v1/payments/confirm` updates order status to "paid"
- Payment intent status: "succeeded"
- Order can be retrieved via GET `/api/v1/orders/:id`

### Step 6: Webhook Verification
Webhooks are triggered when Stripe payment intent events occur.

#### Setup Stripe CLI (local testing)
```bash
# Download Stripe CLI from https://stripe.com/docs/stripe-cli

# Login to Stripe account
stripe login

# Forward Stripe events to local backend
stripe listen --forward-to localhost:4000/api/v1/payments/webhook

# Note the webhook signing secret
# Update STRIPE_WEBHOOK_SECRET in .env
```

#### Webhook Events to Test
Backend should handle these Stripe events:

1. **payment_intent.succeeded**
   - Triggered after successful payment
   - Backend verifies signature
   - Updates order status to "completed"
   - Stores payment intent ID

```bash
# Simulate (with Stripe CLI listening)
stripe trigger payment_intent.succeeded
```

2. **payment_intent.payment_failed**
   - Triggered on payment failure
   - Updates order status to "failed"
   - Stores failure reason

```bash
stripe trigger payment_intent.payment_failed
```

3. **charge.refunded**
   - Triggered on refund
   - Updates order status to "refunded"

## API Testing

### Create Payment Intent
```bash
curl -X POST http://localhost:4000/api/v1/payments/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "orderId": "uuid-here",
    "amount": 5999,
    "currency": "usd"
  }'

# Expected Response:
# {
#   "clientSecret": "pi_..._secret_...",
#   "paymentIntentId": "pi_..."
# }
```

### Confirm Payment
```bash
curl -X POST http://localhost:4000/api/v1/payments/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "paymentIntentId": "pi_...",
    "orderId": "uuid-here"
  }'

# Expected Response:
# {
#   "status": "succeeded",
#   "paymentIntentId": "pi_...",
#   "orderId": "uuid-here"
# }
```

### Webhook Event
```bash
# Stripe will POST to:
POST http://localhost:4000/api/v1/payments/webhook

# Headers:
# stripe-signature: t=timestamp,v1=signature

# Body contains Stripe event object with payment_intent details
```

## Database Verification

### Check Order Status
```sql
-- Connect to PostgreSQL
psql -h localhost -U canvas_user -d canvas_platform

-- View order with payment status
SELECT id, user_id, status, total_amount, created_at, updated_at
FROM "order"
WHERE id = 'your-order-id';

-- View order items
SELECT id, order_id, product_id, quantity, size_selected, frame_option, price
FROM "order_item"
WHERE order_id = 'your-order-id';
```

## Browser DevTools Debugging

### Network Tab
1. Open DevTools → Network tab
2. Filter by `payments` or `orders`
3. Verify requests:
   - `POST /api/v1/payments/create-intent` - Status 200/201
   - `confirmCardPayment()` - Stripe network request
   - `POST /api/v1/payments/confirm` - Status 200
   - `POST /api/v1/payments/webhook` - Status 200/202

### Console Tab
1. Check for errors in JavaScript console
2. Verify Stripe library loaded:
   ```js
   console.log(window.Stripe);  // Should be function
   ```
3. Monitor Redux/Zustand store updates

### Application Tab
1. Verify `.env` variables:
   - Frontend: Check `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` in environment
   - Backend: Verify `.env` file exists with `STRIPE_SECRET_KEY`

## Error Scenarios to Test

### 1. Missing Shipping Address
- Expected: Form validation error before order creation
- Test: Click "Continue to Payment" without address

### 2. Declined Card
- Expected: Error message "Your card was declined"
- Test: Use card `4000 0000 0000 0002`

### 3. Expired Card
- Expected: Error message "Your card has expired"
- Test: Use past expiry date

### 4. Invalid CVC
- Expected: Error message "Invalid CVC"
- Test: Use CVC with wrong format

### 5. Network Error
- Expected: Error message with retry option
- Test: Disconnect internet during payment

### 6. Webhook Signature Mismatch
- Expected: Webhook not processed, logged as failed verification
- Test: Modify `STRIPE_WEBHOOK_SECRET` and trigger event

## Load Testing

### Simulate Multiple Payments
```bash
# Create script to test concurrent payments
for i in {1..10}; do
  curl -X POST http://localhost:4000/api/v1/payments/create-intent \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer TOKEN_$i" \
    -d '{"orderId": "order-$i", "amount": 5999}' &
done
wait
```

## Checklist

- [ ] All environment variables configured
- [ ] Backend Stripe integration loaded
- [ ] Frontend Stripe keys available
- [ ] User can authenticate
- [ ] Canvas editor fully functional
- [ ] Order creation succeeds
- [ ] Payment intent generation works
- [ ] CardElement displays correctly
- [ ] Test card payment succeeds
- [ ] Order status updates to "paid"
- [ ] Webhook events received
- [ ] Failed payment scenario handled
- [ ] Error messages clear and helpful
- [ ] No console errors

## Troubleshooting

### Stripe Keys Not Loading
- Check `.env` file exists and has correct path
- Verify keys start with `sk_test_` (backend) and `pk_test_` (frontend)
- Restart backend/frontend after .env changes

### CardElement Not Showing
- Verify `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` set in frontend `.env`
- Check browser console for Stripe library errors
- Ensure StripePaymentForm component imported correctly

### Webhook Not Received
- Start Stripe CLI before testing: `stripe listen --forward-to localhost:4000/...`
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe CLI output
- Check backend logs for webhook POST attempts

### Payment Confirms But Order Not Updated
- Verify database connection working
- Check OrdersService imported in PaymentModule
- Check order ID format matches database

## Stripe Dashboard Monitoring

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to Test Data → Payment Intents
3. Filter by recent test intents
4. Verify:
   - Amount matches order total
   - Metadata shows correct orderId
   - Status shows succeeded/failed
   - Payment method is test card

## Next Steps

After payment integration is verified:
1. ✅ Set up Stripe Live environment with real keys
2. ✅ Implement Print Worker for PDF generation
3. ✅ Add email notifications for order confirmations
4. ✅ Build Order History page
5. ✅ Create admin dashboard
