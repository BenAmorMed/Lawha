# 🧪 Auth Module Testing Guide

## Quick Test: Using cURL

### 1. Register a New User
```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "full_name": "John Doe"
  }'
```

**Expected Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "customer",
  "created_at": "2026-02-19T10:30:00.000Z"
}
```

---

### 2. Login with User
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "customer",
    "created_at": "2026-02-19T10:30:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400
}
```

---

### 3. Get Current User (Protected Route)
```bash
curl -X GET http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Replace `YOUR_ACCESS_TOKEN_HERE` with the token from login response**

**Expected Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "customer",
  "created_at": "2026-02-19T10:30:00.000Z"
}
```

---

## Test Cases

### ✅ Register - Success
- **Input:** Valid email, password (8+ chars), optional full_name
- **Expected:** 201 Created, user object returned
- **Test:** User can login after registration

### ❌ Register - Email Already Exists
- **Input:** Email that's already registered
- **Expected:** 400 Bad Request, message: "Email already registered"

### ❌ Register - Invalid Email
- **Input:** Invalid email format
- **Expected:** 400 Bad Request, validation error

### ❌ Register - Password Too Short
- **Input:** Password less than 8 characters
- **Expected:** 400 Bad Request, "Password must be at least 8 characters"

---

### ✅ Login - Success
- **Input:** Correct email & password
- **Expected:** 200 OK, user object + JWT token
- **Test:** Token can be used for protected routes

### ❌ Login - Wrong Password
- **Input:** Correct email, wrong password
- **Expected:** 401 Unauthorized, "Invalid credentials"

### ❌ Login - User Not Found
- **Input:** Non-existent email
- **Expected:** 401 Unauthorized, "Invalid credentials"

---

### ✅ Get Current User - Success
- **Input:** Valid JWT token in Authorization header
- **Expected:** 200 OK, current user object

### ❌ Get Current User - Missing Token
- **Input:** No Authorization header
- **Expected:** 401 Unauthorized

### ❌ Get Current User - Invalid Token
- **Input:** Malformed or expired JWT
- **Expected:** 401 Unauthorized

---

## Using Postman/Thunder Client

### Step 1: Register
**Method:** POST  
**URL:** `http://localhost:4000/api/v1/auth/register`  
**Headers:** `Content-Type: application/json`

**Body:**
```json
{
  "email": "test@example.com",
  "password": "TestPass123",
  "full_name": "Test User"
}
```

---

### Step 2: Login
**Method:** POST  
**URL:** `http://localhost:4000/api/v1/auth/login`  
**Headers:** `Content-Type: application/json`

**Body:**
```json
{
  "email": "test@example.com",
  "password": "TestPass123"
}
```

**Copy the `access_token` from response**

---

### Step 3: Test Protected Route
**Method:** GET  
**URL:** `http://localhost:4000/api/v1/auth/me`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer <PASTE_TOKEN_HERE>
```

---

## Error Codes Reference

| Code | Scenario |
|------|----------|
| 400 | Bad Request (validation, duplicate email, etc.) |
| 401 | Unauthorized (wrong password, invalid token) |
| 201 | Created (successful registration) |
| 200 | OK (successful login, fetch user) |

---

## Database Verification

### Check if user was created
```bash
docker compose exec postgres psql -U canvas_user -d canvas_platform

# In psql:
SELECT id, email, full_name, role, created_at FROM users;
```

### Check user password hash
```sql
SELECT id, email, password_hash FROM users WHERE email = 'test@example.com';
```

(Password should be bcrypt hash, not plaintext)

---

## Common Issues & Solutions

### **Issue:** "Database connection error"
**Solution:** 
```bash
docker compose logs postgres
# Wait for "ready to accept connections"
# Restart: docker compose restart postgres
```

### **Issue:** "JWT Secret not found"
**Solution:** 
```bash
# Check .env file exists in backend/
cat backend/.env
# Should have: JWT_SECRET=your_jwt_secret_key_change_in_production
```

### **Issue:** "Port 4000 already in use"
**Solution:**
```bash
# Find what's using it
lsof -i :4000  # macOS/Linux
netstat -ano | findstr :4000  # Windows

# Kill the process or use a different port
```

### **Issue:** "CORS error from frontend"
**Solution:**
- Check NEXT_PUBLIC_API_URL in frontend/.env.local
- Should be: `http://localhost:4000/api/v1`
- Restart frontend after changing

---

## Next Steps

Once Auth is working:

1. ✅ Auth module complete
2. 🔄 Build Products API endpoints
3. 🔄 Build Image upload endpoint
4. 🔄 Build Order management
5. 🔄 Connect frontend components

Let me know when Auth is tested and working! 🚀
