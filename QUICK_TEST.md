# ⚡ Quick Auth Test (Copy-Paste)

## Start Docker
```bash
docker compose up -d
sleep 15
```

---

## Test 1: Register User
```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "full_name": "Test User"
  }'
```

✅ Should see user object

---

## Test 2: Login
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

✅ Should see user + `access_token`

**Copy the token!**

---

## Test 3: Protected Route

```bash
curl -X GET http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer PASTE_TOKEN_HERE"
```

✅ Should see current user

---

## Check Database
```bash
docker compose exec postgres psql -U canvas_user -d canvas_platform
SELECT email, full_name FROM users;
\q
```

✅ Should see test@example.com

---

## All Tests Passed? 🎉
Auth module is working!

**Next: Build Products API**
