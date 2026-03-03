# Email Notifications Implementation Guide

**Status:** ✅ COMPLETE  
**Created:** February 25, 2026  
**Version:** 1.0  

## Overview

The email notification system sends transactional emails to customers for important order events:
- Order confirmation (when order is created)
- Payment successful (when payment succeeds)
- Payment failed (when payment is declined)
- Order shipped (when order status is updated)
- Order refunded (when refund is processed)

All emails are beautifully formatted with HTML templates and include order details.

## Architecture

### Email Service (`backend/src/email/email.service.ts`)
- **Purpose:** Core email sending functionality
- **Provider:** Nodemailer (supports SMTP, SendGrid, AWS SES, etc.)
- **Features:**
  - Template-based email rendering
  - Configurable SMTP or mock transporter
  - Error handling (failures don't block order processing)
  - Development mode with MailHog support
  - Production mode with real SMTP

### Email Methods
```typescript
sendOrderConfirmation(order, userEmail)      // Sent when order created
sendPaymentSuccessful(order, userEmail)      // Sent when payment succeeded
sendPaymentFailed(order, userEmail, reason)  // Sent when payment failed
sendOrderShipped(order, userEmail, tracking) // Sent when order ships
sendOrderRefunded(order, userEmail, amount)  // Sent when refund processed
```

### Integration Points

**OrdersService** (on order creation)
- Fetches user email
- Calls `emailService.sendOrderConfirmation()`
- Non-blocking (doesn't fail if email fails)

**PaymentService** (on payment events)
- Called from PaymentController webhook handlers
- Sends success/failure emails
- Includes refund emails

## Configuration

### Environment Variables

```dotenv
# SMTP Configuration
MAIL_HOST=localhost           # SMTP server hostname
MAIL_PORT=1025                # SMTP server port
MAIL_USER=[optional]          # SMTP username (if required)
MAIL_PASS=[optional]          # SMTP password (if required)
MAIL_FROM=noreply@lawhacanvas.com  # From email address

# Or set to empty/omit for development with MailHog
MAIL_HOST=
MAIL_PORT=
```

## Installation & Setup

### 1. Install Email Dependencies

```bash
cd backend
npm install  # nodemailer and @types/nodemailer already added
```

### 2. Development Setup (Local Testing with MailHog)

**Option A: Using Docker (Recommended)**
```bash
docker run -d \
  --name mailhog \
  -p 1025:1025 \
  -p 8025:8025 \
  mailhog/mailhog

# View sent emails at: http://localhost:8025
```

**Option B: Download MailHog Binary**
```bash
# From https://github.com/mailhog/MailHog/releases
# Extract and run
./MailHog
# View at http://localhost:8025
```

**Option C: No Email (Development Skip)**
```bash
# Leave MAIL_HOST empty or undefined in .env
# Service will use mock transporter (emails won't actually send)
```

### 3. Production Setup (Real Email Sending)

**Using SendGrid:**
```bash
# Get API key from https://sendgrid.com

# In .env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASS=SG.xxxxxxxxxxxxx
MAIL_FROM=noreply@lawhacanvas.com
```

**Using AWS SES:**
```bash
MAIL_HOST=email-smtp.us-east-1.amazonaws.com
MAIL_PORT=587
MAIL_USER=xxxxxxxx
MAIL_PASS=xxxxxxxx
MAIL_FROM=noreply@lawhacanvas.com
```

**Using Gmail:**
```bash
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=app-specific-password  # Use app password, not regular password
MAIL_FROM=noreply@lawhacanvas.com
```

## Testing Email Notifications

### Test 1: Order Confirmation Email

**Steps:**
1. Start MailHog: `docker run -d --name mailhog -p 1025:1025 -p 8025:8025 mailhog/mailhog`
2. Start backend: `npm run start:dev`
3. Login to frontend
4. Create an order and go to checkout
5. Enter shipping address and proceed
6. Check MailHog: **http://localhost:8025**

**Expected:**
- Email from: `noreply@lawhacanvas.com`
- Subject: `Order Confirmed - #XXXXXXXX`
- HTML content with order details, total amount, next steps

**Verify Email Contains:**
- Order ID (first 8 characters)
- Order total amount
- Confirmation message
- Production timeline

### Test 2: Payment Success Email

**Steps:**
1. Continue from above (now on payment step)
2. Enter Stripe test card: `4242 4242 4242 4242`
3. Expiry: any future date (e.g., 12/25)
4. CVC: any 3 digits (e.g., 123)
5. Submit payment
6. Check MailHog for payment success email

**Expected:**
- Subject: `Payment Received - Order #XXXXXXXX`
- Green theme (success styling)
- Payment confirmed message
- Production timeline (5-7 days)
- Shipping info

### Test 3: Payment Failure Email

**Steps:**
1. Go through order and checkout again
2. Use Stripe test card: `4000 0000 0000 0002` (will be declined)
3. Proceed with payment
4. Check MailHog for failure email

**Expected:**
- Subject: `Payment Failed - Order #XXXXXXXX`
- Red/pink theme (warning styling)
- Failure reason explanation
- Instructions to retry payment
- Support contact info

### Test 4: Webhook Payment Success (Advanced)

**Prerequisites:**
- Install Stripe CLI: https://stripe.com/docs/stripe-cli
- Update `STRIPE_WEBHOOK_SECRET` in .env

**Steps:**
```bash
# Terminal 1: Start backend with fresh logs
npm run start:dev

# Terminal 2: Setup Stripe webhook forwarding
stripe login
stripe listen --forward-to localhost:4000/api/v1/payments/webhook

# Note the webhook signing secret from output
# Update STRIPE_WEBHOOK_SECRET in .env

# Restart backend (Ctrl+C, then npm run start:dev)

# Terminal 3: Trigger payment success event
stripe trigger payment_intent.succeeded
```

**Expected:**
- Backend logs show webhook received
- Email sent for payment success
- MailHog shows payment success email

## Email Templates

### 1. Order Confirmation Template
- **File:** `email.service.ts` → `getOrderConfirmationTemplate()`
- **Theme:** Purple gradient header
- **Content:**
  - Order ID and total amount
  - Confirmation message
  - Next steps information
  - Support contact

**Preview:**
```
┌─────────────────────────────┐
│   Order Confirmed! 🎉       │
│     Thank you message       │
│   Order #XXXXXXXX           │
│   Amount: $XX.XX            │
│                             │
│   Next Steps                │
│   Production will begin     │
│   and you'll get updates    │
└─────────────────────────────┘
```

### 2. Payment Success Template
- **File:** `email.service.ts` → `getPaymentSuccessTemplate()`
- **Theme:** Green gradient header
- **Content:**
  - Payment confirmation
  - Amount charged
  - Production timeline (5-7 days)
  - Shipping info

### 3. Payment Failure Template
- **File:** `email.service.ts` → `getPaymentFailedTemplate()`
- **Theme:** Red/pink gradient header
- **Content:**
  - Failure message
  - Possible reasons
  - Retry instructions
  - Support contact

### 4. Order Shipped Template
- **File:** `email.service.ts` → `getOrderShippedTemplate()`
- **Theme:** Blue gradient header
- **Content:**
  - Shipping confirmation
  - Tracking number (if available)
  - Delivery estimate
  - Package tracking link

### 5. Order Refunded Template
- **File:** `email.service.ts` → `getOrderRefundedTemplate()`
- **Theme:** Green gradient header
- **Content:**
  - Refund amount
  - Processing timeline (3-5 days)
  - Bank account info
  - Support contact

## Debugging

### Check Email Service Logs

```bash
# Backend logs will show:
[EmailService] Email sent successfully to user@example.com: Order Confirmed - #ABCD1234
[EmailService] Failed to send email to user@example.com: Connection refused
```

### Verify Email Configuration

```bash
# Check .env file exists and has values
cat .env | grep MAIL_

# Should output:
# MAIL_HOST=localhost
# MAIL_PORT=1025
# MAIL_FROM=noreply@lawhacanvas.com
```

### Test SMTP Connection (Manual)

```bash
# Create test script to verify SMTP is reachable
telnet localhost 1025

# Should show:
# Trying 127.0.0.1...
# Connected to localhost.
# Escape character is '^]'.
# 220 mailhog.example ESMTP MailHog
```

### MailHog Web Interface

**URL:** http://localhost:8025

**Features:**
- View all sent emails
- Click email to see full HTML
- Raw email source view
- Release email (resend to real SMTP)
- Delete individual or all emails

**How to inspect email:**
1. Send order through checkout
2. Go to http://localhost:8025
3. Click on latest email
4. View HTML to verify formatting
5. View raw message to confirm headers

## Error Handling

### Email Failures Don't Block Orders

The system is designed so that email failures don't prevent order creation or payment processing:

```typescript
try {
  const user = await this.userRepository.findOne(userId);
  if (user && user.email) {
    await this.emailService.sendOrderConfirmation(order, user.email);
  }
} catch (error) {
  console.error('Failed to send email:', error);
  // Order is still created - customers can still checkout
}
```

### Common Issues & Solutions

**Issue:** "Connection refused" when sending email
- **Cause:** MailHog not running or wrong port
- **Solution:** Start MailHog with `docker run -d --name mailhog -p 1025:1025 -p 8025:8025 mailhog/mailhog`

**Issue:** "Invalid SMTP credentials"
- **Cause:** Wrong username/password for SMTP server
- **Solution:** Verify credentials in .env match provider requirements

**Issue:** "Email not arriving in production"
- **Cause:** SMTP server blocked or domain reputation
- **Solution:** Use SendGrid/AWS SES instead of generic SMTP

**Issue:** "HTML templates not rendering correctly"
- **Cause:** Email client CSS limitations
- **Solution:** Templates use inline styles for maximum compatibility

## Performance Considerations

### Async Email Sending
All email sending is async and non-blocking:
```typescript
// Email is sent in background, doesn't delay response
await emailService.sendEmail(...);  // Fire and forget is safe
```

### Email Queue (Future Enhancement)
For high-volume sending, consider adding Bull Queue:
```typescript
@InjectQueue('email')
private emailQueue: Queue;

async sendEmail(email) {
  await this.emailQueue.add(email, { attempts: 3 });
}
```

### Rate Limiting (Future)
If using SendGrid/AWS SES:
- Implement rate limiting per user
- Queue emails if hitting API limits
- Monitor sending quota

## Compliance

### Privacy & Data Protection
- Email addresses used only for transactional emails
- No marketing emails without opt-in
- GDPR-compliant unsubscribe would be added in future

### Email Content Guidelines
- Include order ID and amount for customer reference
- Provide support contact information
- Use clear, professional language
- Include company branding and footer

### Sender Authentication
Recommended for production:
- **SPF (Sender Policy Framework):** Authorize SMTP servers
- **DKIM (DomainKeys Identified Mail):** Sign emails with domain key
- **DMARC (Domain-based Message Authentication):** Set policy for failed auth

**Setup SPF:**
```dns
v=spf1 include:sendgrid.net ~all
```

## Future Enhancements

### 1. Email Templates in Database
Currently templates are hardcoded in service. Could add:
- Database storage for templates
- Admin UI to customize templates
- Template variables system

### 2. Email History Tracking
Add table to track sent emails:
```sql
CREATE TABLE email_log (
  id UUID PRIMARY KEY,
  order_id UUID,
  user_id UUID,
  email_address VARCHAR,
  email_type VARCHAR,
  subject VARCHAR,
  sent_at TIMESTAMP,
  error_message VARCHAR
);
```

### 3. Email Preferences
User account page with options:
- Receive promotional emails
- Frequency: all, daily digest, none
- Unsubscribe from specific types

### 4. Notification Services
Add support for:
- SMS notifications
- Push notifications
- In-app notifications
- Slack/Teams webhooks

### 5. Email Analytics
Track via SendGrid/AWS SES:
- Open rates
- Click rates
- Bounce rates
- Unsubscribe tracking

## Testing Checklist

- [ ] Order confirmation email sends when order created
- [ ] Email contains correct order ID and amount
- [ ] HTML template renders correctly in MailHog
- [ ] Payment success email sends after successful payment
- [ ] Payment failure email sends after declined card
- [ ] Emails not blocked in production (correct SMTP settings)
- [ ] Email failures logged but don't block order processing
- [ ] User email address properly retrieved from database
- [ ] Webhook email triggers work (advanced testing)
- [ ] Email footer contains company name and copyright

## Support

**Questions or Issues?**
- Check backend logs: `npm run start:dev`
- View sent emails: MailHog web UI (http://localhost:8025)
- Review `.env` file for correct SMTP configuration
- Check EmailService class for template content

**For Production:**
- Use SendGrid or AWS SES instead of local SMTP
- Setup SPF/DKIM records for authentication
- Monitor email delivery rates
- Implement email address validation

---

**Email Notifications Status:** ✅ COMPLETE - Ready for testing and production deployment
