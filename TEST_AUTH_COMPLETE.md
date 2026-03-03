# 🧪 Auth Module - Complete Testing Guide

## Step 1: Start Docker Services

```bash
# From project root (files/ directory)
docker compose up -d
```

**Wait 15 seconds for all services to start**

Check status:
```bash
docker compose ps
```

You should see:
- ✅ canvas_postgres (healthy)
- ✅ canvas_redis (healthy)  
- ✅ canvas_minio (healthy)
- ✅ canvas_api (up)
- ✅ canvas_frontend (up)
- ✅ canvas_print_worker (up)

---

## Step 2: Verify Backend is Running

```bash
curl http://localhost:4000/api/v1/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-19T10:00:00.000Z"
}
```

If this fails:
```bash
# Check backend logs
docker compose logs -f api
```

---

## Step 3: Test Auth Endpoints

### Test 3.1: Register a User

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123",
    "full_name": "John Doe"
  }'
```

**Expected Status:** 201 Created

**Expected Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "full_name": "John Doe",
  "role": "customer",
  "created_at": "2026-02-19T10:00:00.000Z"
}
```

✅ **If you see this: Registration works!**

---

### Test 3.2: Try Registering with Same Email (Should Fail)

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "AnotherPass123",
    "full_name": "Jane Doe"
  }'
```

**Expected Status:** 400 Bad Request

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": "Email already registered"
}
```

✅ **If you see this: Duplicate prevention works!**

---

### Test 3.3: Register Another User (for testing)

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "SecurePass456",
    "full_name": "Jane Smith"
  }'
```

**Expected Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "email": "jane@example.com",
  "full_name": "Jane Smith",
  "role": "customer",
  "created_at": "2026-02-19T10:00:00.000Z"
}
```

✅ **If you see this: Second user created!**

---

### Test 3.4: Login with Correct Credentials

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Expected Status:** 200 OK

**Expected Response:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "customer",
    "created_at": "2026-02-19T10:00:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE3Mzc1NDU2MDAsImV4cCI6MTczNzYzMjAwMH0.abcdef123456...",
  "expires_in": 86400
}
```

✅ **If you see this: Login works! Copy the `access_token`**

---

### Test 3.5: Login with Wrong Password (Should Fail)

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "WrongPassword123"
  }'
```

**Expected Status:** 401 Unauthorized

**Expected Response:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

✅ **If you see this: Password validation works!**

---

### Test 3.6: Login with Non-existent User (Should Fail)

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "AnyPassword123"
  }'
```

**Expected Status:** 401 Unauthorized

**Expected Response:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

✅ **If you see this: User not found handling works!**

---

### Test 3.7: Get Current User (Protected Route)

**IMPORTANT:** Replace `YOUR_TOKEN_HERE` with the `access_token` from the login response above

```bash
curl -X GET http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Status:** 200 OK

**Expected Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "full_name": "John Doe",
  "role": "customer",
  "created_at": "2026-02-19T10:00:00.000Z"
}
```

✅ **If you see this: Protected routes work!**

---

### Test 3.8: Access Protected Route without Token (Should Fail)

```bash
curl -X GET http://localhost:4000/api/v1/auth/me
```

**Expected Status:** 401 Unauthorized

**Expected Response:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

✅ **If you see this: Route protection works!**

---

### Test 3.9: Access Protected Route with Invalid Token (Should Fail)

```bash
curl -X GET http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer invalid_token_12345"
```

**Expected Status:** 401 Unauthorized

**Expected Response:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

✅ **If you see this: Token validation works!**

---

## Step 4: Verify Data in Database

### Connect to Database

```bash
docker compose exec postgres psql -U canvas_user -d canvas_platform
```

### View All Users

```sql
SELECT id, email, full_name, role, created_at FROM users;
```

**Expected Output:**
```
                  id                  |      email      | full_name  |   role   |            created_at
--------------------------------------+-----------------+------------+----------+-------------------------------
 550e8400-e29b-41d4-a716-446655440000 | john@example.com | John Doe   | customer | 2026-02-19 10:00:00+00
 550e8400-e29b-41d4-a716-446655440001 | jane@example.com | Jane Smith | customer | 2026-02-19 10:00:01+00
```

### Verify Password is Hashed

```sql
SELECT email, password_hash FROM users WHERE email = 'john@example.com';
```

**Expected Output:**
```
      email      |                           password_hash
-----------------+---------------------------------------------------------------
 john@example.com | $2b$10$xyz...abcdef (bcrypt hash, not plaintext)
```

✅ **If password starts with `$2b$`: Hashing works!**

### Count Users

```sql
SELECT COUNT(*) FROM users;
```

**Expected:** Should show 2 (john and jane)

### Exit psql

```
\q
```

---

## Step 5: Summary Test Results

Create a checklist of what worked:

- [ ] Health endpoint returns OK
- [ ] Registration creates user
- [ ] Duplicate email rejected
- [ ] Login returns JWT token
- [ ] Wrong password rejected
- [ ] Non-existent user rejected
- [ ] Protected route returns user
- [ ] No token rejected
- [ ] Invalid token rejected
- [ ] Users visible in database
- [ ] Passwords are hashed

**All ✅? Auth module is working perfectly!**

---

## Troubleshooting

### Issue: "Cannot POST /api/v1/auth/register"
**Solution:** Backend not running
```bash
docker compose logs api
# Wait for "listening on port 4000"
```

### Issue: "Connection refused"
**Solution:** Services not started
```bash
docker compose ps
docker compose up -d
```

### Issue: Database connection error
**Solution:** PostgreSQL not ready
```bash
docker compose logs postgres
# Wait for "ready to accept connections"
docker compose restart postgres
```

### Issue: "Email already registered" but it's new
**Solution:** Database not fresh
```bash
docker compose down -v
docker compose up -d
# Now test again
```

---

## What's Working? 

If you passed all tests above, you have:

✅ User registration with validation  
✅ Password hashing with bcrypt  
✅ JWT token generation  
✅ Protected routes with guards  
✅ Error handling  
✅ Database integration  
✅ API endpoints  

**Auth module is production-ready!** 🎉

---

## Next Steps

After confirming auth works:

1. ✅ **Auth tested** ← You are here
2. 📝 Build **Products API** endpoints
3. 📝 Build **Image Upload** feature
4. 📝 Build **Orders** management
5. 📝 Create **Auth UI** components

Ready for Products API? 🚀
