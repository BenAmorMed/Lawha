# Application Startup & Testing Guide

## Current Status

**Application**: Lawha Canvas Platform (with SendGrid Email Migration)  
**Date**: February 26, 2026  
**Components**: 
- ✅ Backend (NestJS) - Ready
- ✅ Frontend (Next.js) - Ready
- ✅ Email Service - Migrated to SendGrid
- ⚠️ Database - Requires PostgreSQL/Docker
- ⚠️ Redis - Requires Docker or local installation
- ⚠️ MinIO - Requires Docker or local installation

---

## Prerequisites

### Required
- Node.js v16+ (check: `node --version`)
- npm v8+ (check: `npm --version`)
- Git (for version control)

### Optional (for full stack)
- Docker & Docker Compose (for database, Redis, MinIO)
- PostgreSQL 15+ (if not using Docker)
- Redis 6+ (if not using Docker)

---

## Quick Start Options

### Option A: Backend Only (API Testing)
**Time**: 5-10 minutes  
**Requirements**: Node.js + npm  
**Limitation**: No database persistence (will fail on DB-dependent endpoints)

```bash
cd backend
npm install --legacy-peer-deps
npm run start
```

### Option B: Full Stack with Docker Compose
**Time**: 15-30 minutes  
**Requirements**: Docker Desktop installed and running  
**Benefit**: All services (DB, Redis, MinIO, Backend, Frontend) ready to use

```bash
docker-compose up -d
```

### Option C: Backend + Test Database (PostgreSQL)
**Time**: 10-20 minutes  
**Requirements**: Local PostgreSQL running  
**Note**: Requires configuration changes to .env

---

## Detailed Setup: Option B - Docker Compose (Recommended)

### Step 1: Verify Docker Installation

```bash
# Check Docker
docker --version

# Check Docker Compose
docker-compose --version

# Verify Docker daemon is running
docker ps
```

**Troubleshooting**: If Docker is not running:
- Start Docker Desktop from Windows Start Menu
- Wait 1-2 minutes for it to fully start
- Try `docker ps` again

### Step 2: Start All Services

```bash
cd c:\Users\bichiou\Documents\2025-2026\stage\Project\files
docker-compose up -d
```

**What This Does**:
- PostgreSQL 16 (database): http://localhost:5432
- Redis 7 (cache): localhost:6379
- MinIO (S3 storage): http://localhost:9000
- Backend (API): http://localhost:3000
- Frontend (Web): http://localhost:3001

### Step 3: Check Service Status

```bash
docker-compose ps
```

**Expected Output**:
```
NAME            STATUS          PORTS
postgres        Up 2 minutes    5432/tcp
redis           Up 2 minutes    6379/tcp
minio           Up 2 minutes    9000/tcp, 9001/tcp
backend         Up 2 minutes    3000/tcp
frontend        Up 2 minutes    3001/tcp
```

### Step 4: View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Step 5: Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Docs (Swagger)**: http://localhost:3000/api/docs
- **MinIO Console**: http://localhost:9001 (Username: minioadmin, Password: minioadmin123)

---

## Detailed Setup: Option A - Local Backend Only

### Step 1: Navigate to Backend

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install --legacy-peer-deps
```

### Step 3: Configure Environment

The `.env` file is already configured for development with mock email:

```env
SENDGRID_API_KEY=              # Empty = mock email mode
MAIL_FROM=noreply@lawhacanvas.com
NODE_ENV=development
PORT=3000
```

**For Testing with SendGrid** (optional):
1. Get SendGrid API key: https://app.sendgrid.com/settings/api_keys
2. Add to `.env`:
```env
SENDGRID_API_KEY=SG_your_key_here
```

### Step 4: Start Development Server

```bash
npm run start:dev
```

**Expected Output**:
```
[Nest] 12:34:56 PM - 01/01/2026  LOG [NestFactory] Starting Nest application...
[Nest] 12:34:57 PM - 01/01/2026  LOG [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] 12:34:57 PM - 01/01/2026  LOG [InstanceLoader] ConfigModule dependencies initialized
...
[Nest] 12:34:58 PM - 01/01/2026  LOG Application listening on port 3000
```

### Step 5: Test Backend Connectivity

In another terminal:
```bash
curl http://localhost:3000/api/health
```

---

## Email Service Testing

### Test 1: Mock Email Mode (No API Key)

**Setup**:
```env
SENDGRID_API_KEY=
NODE_ENV=development
```

**Expected Behavior**:
- Emails logged to console: `[MOCK EMAIL] To: user@example.com, Subject: ...`
- No actual emails sent
- No SendGrid account needed

**Check**:
```bash
# Trigger an order confirmation email
# Look in console output for:
# [MOCK EMAIL] To: customer@example.com, Subject: Order Confirmed...
```

### Test 2: Real SendGrid Integration

**Setup**:
1. Create SendGrid account: https://sendgrid.com
2. Get API key from dashboard (Settings → API Keys)
3. Update `.env`:
```env
SENDGRID_API_KEY=SG_your_key_here
```

**Expected Behavior**:
- Emails sent through SendGrid API
- Visible in SendGrid dashboard → Mail Activity
- Real delivery to recipients

### Test 3: Email Service Unit Tests

```bash
# Run all tests
npm run test

# Run email service tests only
npm run test -- email.service

# Run with coverage
npm run test:cov
```

---

## API Testing

### Test 1: Health Check

```bash
curl http://localhost:3000/api/health
```

### Test 2: Authentication (Register)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "fullName": "Test User"
  }'
```

### Test 3: Authentication (Login)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

**Expected Response**:
```json
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Test User"
  }
}
```

### Test 4: Get Products

```bash
curl http://localhost:3000/api/products
```

---

## Frontend Access

### With Docker Compose

Frontend automatically starts at: **http://localhost:3001**

### Local Frontend Development

```bash
cd frontend
npm install
npm run dev
```

Open: **http://localhost:3000**

---

## Stopping Services

### Docker Compose

```bash
# Stop all services (keeps data)
docker-compose stop

# Stop and remove containers (data preserved in volumes)
docker-compose down

# Stop and remove everything including data
docker-compose down -v
```

### Local Backend

Press `Ctrl+C` in the terminal running `npm run start:dev`

---

## Troubleshooting

### Issue: Docker containers won't start

**Error**: `unable to get image 'redis:7-alpine'`

**Solution**:
1. Ensure Docker Desktop is running
2. Click Docker icon in system tray
3. Wait for "Docker is running" message
4. Try again: `docker-compose up -d`

### Issue: Backend crashes with "Can't reach database"

**Cause**: PostgreSQL not running

**Solutions**:
- Option A: Use Docker Compose (includes PostgreSQL)
- Option B: Install PostgreSQL locally and update .env with connection details
- Option C: Skip database-dependent testing

### Issue: "SENDGRID_API_KEY is required in production"

**Explanation**: Backend requires API key in production mode

**Solutions**:
- Set `NODE_ENV=development` in .env to use mock mode
- OR provide valid SENDGRID_API_KEY
- OR leave SENDGRID_API_KEY empty for mock emails

### Issue: Port 3000 already in use

**Solution**:
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process by PID
taskkill /PID <PID> /F

# Or change port in .env
PORT=3001
```

---

## Performance & Monitoring

### Check Backend Logs

```bash
# Last 100 lines from backend container
docker-compose logs -n 100 backend

# Follow logs in real-time
docker-compose logs -f backend
```

### Monitor Resources

```bash
# Check CPU/Memory usage of containers
docker stats
```

### Database Connection Verification

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U canvas_user -d canvas_platform

# List tables
\dt

# Exit
\q
```

---

## Next Steps After Starting

1. **Create Test User**
   - Go to frontend: http://localhost:3001
   - Register new account
   - Check console for [MOCK EMAIL] confirmation

2. **Create Test Product**
   - Use admin endpoints or directly insert via database
   - See PRODUCTS_API_TESTING.md for details

3. **Test Canvas Editor**
   - Create a product
   - Navigate to product detail
   - Draw on canvas

4. **Test Orders**
   - Add product to cart
   - Checkout
   - Check email notifications

5. **Monitor Emails**
   - Development (mock): Check console logs
   - Production (SendGrid): Check dashboard at https://app.sendgrid.com

---

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend is accessible at localhost:3001
- [ ] Can register new user
- [ ] Can login with user credentials
- [ ] Can view products list
- [ ] Can view product details
- [ ] Can use canvas editor
- [ ] Can add product to cart
- [ ] Can checkout with Stripe test card
- [ ] Order confirmation email sent/logged
- [ ] Email appears in console or SendGrid dashboard

---

## Useful Commands Reference

```bash
# Start services
docker-compose up -d
npm run start:dev

# Stop services
docker-compose stop
Ctrl+C

# Check status
docker-compose ps
curl http://localhost:3000/api/health

# View logs
docker-compose logs -f backend
npm run start:dev    # See output directly

# Test email
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Database access
docker-compose exec postgres psql -U canvas_user -d canvas_platform

# Clean reset
docker-compose down -v && docker-compose up -d
```

---

## Documentation Files

Related documentation for more details:

- [docs/EMAIL_SERVICE_REFACTOR.md](../docs/EMAIL_SERVICE_REFACTOR.md) - Email implementation details
- [docs/ENVIRONMENT_VARIABLES_CONFIG.md](../docs/ENVIRONMENT_VARIABLES_CONFIG.md) - Environment setup
- [docs/PACKAGE_JSON_DEPENDENCIES.md](../docs/PACKAGE_JSON_DEPENDENCIES.md) - Dependencies
- [QUICK_REFERENCE.md](../QUICK_REFERENCE.md) - Quick commands reference
- [ARCHITECTURE.md](../ARCHITECTURE.md) - System architecture

---

## Support

For issues or detailed information, refer to the documentation files listed above or check:
- Backend logs: `docker-compose logs -f backend`
- Frontend logs: `docker-compose logs -f frontend`
- Application console output (during npm run start:dev)

---

**Last Updated**: February 26, 2026
**Status**: Ready for testing
