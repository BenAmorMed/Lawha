# 🚀 Auth Module - Quick Start

## Start the Stack

```bash
docker compose up -d
```

Wait 10-15 seconds for services to be healthy.

---

## Test the Auth Module

### 1. Register a User

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "MyPassword123",
    "full_name": "John Doe"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "MyPassword123"
  }'
```

**Copy the `access_token` from response**

### 3. Test Protected Route

```bash
curl -X GET http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Check Logs

```bash
# Backend logs
docker compose logs -f api

# Database logs
docker compose logs -f postgres

# All logs
docker compose logs -f
```

---

## Verify in Database

```bash
# Connect to database
docker compose exec postgres psql -U canvas_user -d canvas_platform

# View users table
SELECT id, email, full_name, role, created_at FROM users;

# Exit psql
\q
```

---

## What's Next?

- ✅ Auth complete
- 📝 Build Products API
- 📝 Build Image Upload
- 📝 Build Orders

**Ready to build Products API?** 🎯
