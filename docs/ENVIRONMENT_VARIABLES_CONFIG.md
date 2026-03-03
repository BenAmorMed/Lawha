# Environment Variables Configuration Update

## Overview

Updated environment variable configuration to replace SMTP-based email setup with SendGrid API key approach, simplifying production email configuration.

**File**: `backend/.env.example`  
**Date**: February 26, 2026  
**Type**: Configuration Documentation  
**Impact**: Developers and DevOps teams

---

## Changes Made

### Email Configuration Section

#### Removed (Old SMTP Configuration)
```env
# Email Configuration (Optional for development, required for production)
# For development use MailHog (http://localhost:1025) or leave empty to disable email
# For production use SendGrid, AWS SES, or your SMTP provider
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USER=
MAIL_PASS=
MAIL_FROM=noreply@lawhacanvas.com
```

**Issues with Previous Setup**:
- 4 separate variables required
- Confusion about MailHog vs production setup
- Manual SMTP credential management
- No guidance on production email service
- No support for large file attachments

#### Added (New SendGrid Configuration)
```env
# Email Configuration - SendGrid (Optional for development, required for production)
# Get your API key from: https://app.sendgrid.com/settings/api_keys
# Leave empty in development to mock email sending
SENDGRID_API_KEY=your_sendgrid_api_key_SG_...
MAIL_FROM=noreply@lawhacanvas.com
```

**Improvements**:
- Single API key variable (cleaner)
- Direct link to SendGrid dashboard
- Clear instructions for development (mock mode)
- Production-ready by default
- Support for large attachments

---

## Variable Details

### SENDGRID_API_KEY

**Type**: String (API Key)  
**Format**: Starts with `SG_` followed by alphanumeric characters  
**Example**: `SG_1234567890_abcdefghijklmnop`  
**Required**: 
- ✅ Yes (production)
- ❌ No (development - will mock emails)

**Where to Get**:
1. Create SendGrid account: https://sendgrid.com
2. Log in to dashboard
3. Settings → API Keys
4. Click "Create API Key"
5. Grant "Mail Send" permission
6. Copy the key (shown only once)
7. Paste into your `.env` file

**Security**:
- Never commit to repository
- Rotate periodically (at least every 90 days)
- Use GitHub Secrets for CI/CD
- Use AWS Secrets Manager, HashiCorp Vault, or similar for production
- Revoke immediately if compromised

### MAIL_FROM

**Type**: String (Email Address)  
**Format**: Valid email address  
**Example**: `noreply@lawhacanvas.com`  
**Required**: ✅ Yes  
**Purpose**: Sender email shown in "From" field of emails

**Important Notes**:
- Must match a verified sender in SendGrid account
- Can be changed per email type if needed
- For domain authentication, use domain email (better deliverability)
- Supports display name: `"Lawha Canvas" <noreply@lawhacanvas.com>`

---

## Setup by Environment

### Development Setup

**Option 1: Mock Mode (No SendGrid Account Needed)**

```env
# .env (development)
SENDGRID_API_KEY=
MAIL_FROM=noreply@lawhacanvas.com
NODE_ENV=development
```

**Result**:
- Emails logged to console with `[MOCK EMAIL]` prefix
- No actual email sent
- No SendGrid account required
- Perfect for local development and testing

**Example Log Output**:
```
[MOCK EMAIL] To: user@example.com, Subject: Order Confirmed - #ABC12345
[MOCK EMAIL] To: admin@example.com, Subject: Payment Received - #ABC12345
```

**Option 2: Real Emails (SendGrid Account Required)**

```env
# .env (development with SendGrid)
SENDGRID_API_KEY=SG_your_development_key_here
MAIL_FROM=noreply@lawhacanvas.com
NODE_ENV=development
```

**Result**:
- Real emails sent via SendGrid API
- Can verify in SendGrid dashboard → Mail Activity
- Useful for integration testing
- Requires SendGrid account

### Staging Setup

```env
# .env (staging)
SENDGRID_API_KEY=SG_your_staging_key_here
MAIL_FROM=staging@lawhacanvas.com
NODE_ENV=production
```

**Notes**:
- Use separate API key from production
- Can track staging emails in SendGrid dashboard
- Set `NODE_ENV=production` to enforce API key requirement

### Production Setup

```env
# .env (production via environment variables)
SENDGRID_API_KEY=SG_your_production_key_here
MAIL_FROM=noreply@lawhacanvas.com
NODE_ENV=production
```

**Critical Requirements**:
- ✅ SENDGRID_API_KEY must be set (throws error if missing in production)
- ✅ Use strong API key (generate new one, never reuse dev key)
- ✅ Store in secret manager (AWS Secrets Manager, GitHub Secrets, etc.)
- ✅ Restrict key to "Mail Send" permission only
- ✅ Verify sender domain in SendGrid dashboard
- ✅ Set up webhook for bounce/delivery events

---

## Migration Checklist

### For Developers

- [ ] Delete old `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS` from local `.env`
- [ ] Add `SENDGRID_API_KEY=` (empty) to local `.env`
- [ ] Ensure `MAIL_FROM` is present
- [ ] Run `npm install --legacy-peer-deps`
- [ ] Test email sending: `npm run start`
- [ ] Verify mock emails logged to console

### For DevOps/Staging

- [ ] Create SendGrid account
- [ ] Generate staging API key
- [ ] Add to staging environment variables
- [ ] Test email sending in staging
- [ ] Monitor email delivery in SendGrid dashboard
- [ ] Document API key location and rotation schedule

### For Production Deployment

- [ ] Create production SendGrid account (separate from staging)
- [ ] Generate production API key with tighter permissions
- [ ] Store in secret manager (not committed to git)
- [ ] Verify sender domain in SendGrid
- [ ] Configure email bounce/delivery webhooks
- [ ] Set up monitoring and alerts
- [ ] Test email sending with production key
- [ ] Document API key rotation procedure
- [ ] Set rotation reminder (every 90 days)

---

## Removed Variables - What to Do

If migrating an existing installation, remove these from your `.env` file:

```env
# DELETE THESE:
MAIL_HOST=...          # No longer used
MAIL_PORT=...          # No longer used
MAIL_USER=...          # No longer used
MAIL_PASS=...          # No longer used
```

**If Forgotten**:
- ✅ No harm if left in `.env` (they're ignored)
- ✅ Will not cause errors
- ✅ Recommended to clean up for clarity

---

## Common Issues & Solutions

### Issue: Email fails with "No credentials provided"

**Cause**: `SENDGRID_API_KEY` not set in production environment  
**Solution**:
1. Verify .env file has `SENDGRID_API_KEY=SG_xxxxx`
2. Check API key is correct (copy from SendGrid dashboard again)
3. Ensure API key starts with `SG_`
4. Verify environment variable is actually loaded (check logs)

### Issue: "Invalid email from address"

**Cause**: `MAIL_FROM` email not verified in SendGrid  
**Solution**:
1. Log in to SendGrid dashboard
2. Go to Settings → Sender Authentication
3. Click "Verify a Single Sender"
4. Use the same email as `MAIL_FROM` in `.env`
5. Check email inbox for verification link
6. Click link to verify sender

### Issue: Email sent, but marked as spam/bounce

**Cause**: Sender not authenticated with SendGrid  
**Solution** (for production):
1. Verify single sender as above
2. Or set up full domain authentication
3. Add SPF, DKIM, DMARC records to your domain's DNS
4. Wait 24-48 hours for DNS propagation

### Issue: Emails in development mode not appearing anywhere

**Expected Behavior**: If `SENDGRID_API_KEY` is empty  
**Check**:
```bash
# Should see in application logs:
[MOCK EMAIL] To: user@example.com, Subject: ...
```

This is correct - emails are mocked when no API key is set.

**To Send Real Emails**:
1. Get SendGrid API key
2. Add to `.env`: `SENDGRID_API_KEY=SG_...`
3. Restart application
4. Test email sending again

---

## Security Best Practices

### 1. Never Commit API Keys

❌ **Bad**:
```env
# DON'T COMMIT THIS TO GIT
SENDGRID_API_KEY=SG_my_actual_key_12345
```

✅ **Good**:
```env
# Only committed to repository
SENDGRID_API_KEY=your_sendgrid_api_key_SG_...

# Real key in .env (local/server only)
SENDGRID_API_KEY=SG_actual_key_12345
```

### 2. Use GitHub Secrets for CI/CD

```yaml
# .github/workflows/deploy.yml
env:
  SENDGRID_API_KEY: ${{ secrets.SENDGRID_API_KEY_PRODUCTION }}
```

### 3. Rotate Keys Regularly

- Set calendar reminder for every 90 days
- Generate new key in SendGrid dashboard
- Update environment variables
- Revoke old key

### 4. Restrict API Key Permissions

In SendGrid dashboard:
- Create API key with only "Mail Send" permission
- Avoid "Full Access" permissions
- Document what each key is used for

### 5. Monitor Key Usage

- Watch SendGrid dashboard for unusual activity
- Set up email alerts for failed send attempts
- Review webhook events for patterns

---

## Reference Format

### Valid MAIL_FROM Examples

```env
# Simple format
MAIL_FROM=noreply@lawhacanvas.com

# With display name
MAIL_FROM=Lawha Canvas <noreply@lawhacanvas.com>

# Domain email
MAIL_FROM=orders@lawhacanvas.com

# Different per environment
# Development:
MAIL_FROM=dev-noreply@lawhacanvas.com

# Staging:
MAIL_FROM=staging-noreply@lawhacanvas.com

# Production:
MAIL_FROM=noreply@lawhacanvas.com
```

### Valid SENDGRID_API_KEY Examples

```env
# Format: SG_ followed by alphanumeric
SENDGRID_API_KEY=SG_1234567890_abcdefghijklmnopqrstuvwxyz123456

# Common key length: 80-90 characters (including SG_ prefix)

# Development (if using)
SENDGRID_API_KEY=SG_dev_key_here

# Staging (separate from production)
SENDGRID_API_KEY=SG_staging_key_here

# Production (strongest protection)
SENDGRID_API_KEY=SG_prod_key_here
```

---

## Environment Variable Location Reference

**File**: `backend/.env.example`  
**Email Configuration Section**: Lines 26-29  
**Section Header**: "# Email Configuration - SendGrid"

---

## Related Documentation

- [EMAIL_SERVICE_REFACTOR.md](./EMAIL_SERVICE_REFACTOR.md) - Code implementation changes
- [PACKAGE_JSON_DEPENDENCIES.md](./PACKAGE_JSON_DEPENDENCIES.md) - Package dependency updates
- [SendGrid API Documentation](https://docs.sendgrid.com/)
- [SendGrid Settings Guide](https://docs.sendgrid.com/ui/account-and-settings/)
- Main Migration Guide: `EMAIL_SENDGRID_MIGRATION.md`

---

## Summary Table

| Aspect | Before | After |
|--------|--------|-------|
| **Variables** | 4 (MAIL_HOST, PORT, USER, PASS) | 1 (SENDGRID_API_KEY) |
| **Complexity** | High (SMTP setup) | Low (API key) |
| **Development** | Requires MailHog or SMTP setup | Mock mode without setup |
| **Documentation** | Minimal | Detailed with instructions |
| **Security** | SMTP credentials | API key with permissions |
| **Scalability** | SMTP connection limits | API rate limits (generous) |
| **File** | backend/.env.example | backend/.env.example |
