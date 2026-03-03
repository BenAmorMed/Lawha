# 🧪 Auth Testing - Complete Setup Guide

## 📋 Testing Resources Created

| File | Purpose |
|------|---------|
| **TEST_AUTH_COMPLETE.md** | 9-part step-by-step testing guide |
| **QUICK_TEST.md** | Quick copy-paste commands (3 tests) |
| **test-auth.ps1** | Automated Windows PowerShell script |
| **TESTING_PHASE.md** | Complete testing documentation |

---

## 🚀 Quick Start (Choose One Method)

### Method 1: Automated Testing (Windows PowerShell) ⭐ EASIEST
```powershell
cd c:\Users\bichiou\Documents\2025-2026\stage\Project\files
.\test-auth.ps1
```

**What it does:**
- Starts Docker services
- Runs all 8 tests automatically
- Shows results with ✅ / ❌
- Takes ~30 seconds
- No manual work needed

---

### Method 2: Quick Manual Testing (3 Tests - 5 min)
```bash
cd c:\Users\bichiou\Documents\2025-2026\stage\Project\files
docker compose up -d
sleep 15

# Test 1: Register
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'

# Copy the token from login response before this
# Test 2: Login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'

# Test 3: Protected Route (use token from above)
curl -X GET http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Method 3: Complete Step-by-Step Testing (15 min)
Follow: **TEST_AUTH_COMPLETE.md**
- 9 detailed tests
- Expected responses shown
- Troubleshooting included
- Database verification

---

## 📊 Tests That Will Run

| # | Test | Expected |
|---|------|----------|
| 1 | Health check | ✅ OK |
| 2 | Register user | ✅ User created |
| 3 | Duplicate email | ❌ Rejected |
| 4 | Login correct | ✅ JWT token |
| 5 | Login wrong password | ❌ Rejected |
| 6 | Login non-existent | ❌ Rejected |
| 7 | Protected with token | ✅ User returned |
| 8 | Protected no token | ❌ Rejected |
| 9 | Protected bad token | ❌ Rejected |

---

## ✨ What Gets Verified

### Registration ✅
```
Input: email, password, full_name
Output: user object (no password hash)
Database: user stored with hashed password
Validation: email format, password length
Security: bcrypt hashing (10 rounds)
```

### Login ✅
```
Input: email, password
Output: user + JWT token
Database: find user, verify hash
Token: 24h expiry, signed with secret
Response: includes expires_in (86400 seconds)
```

### Protected Routes ✅
```
Guard: JwtAuthGuard validates header
Parse: Extract Bearer token
Verify: Check signature & expiration
Inject: Current user in request
Error: 401 if invalid/missing
```

### Database ✅
```
Table: users
Columns: id, email, password_hash, full_name, role, created_at, updated_at
Indexes: email unique
Hashing: bcrypt $2b$ format
Timestamps: auto-managed
```

---

## 🔍 What to Look For

### Success Signs ✅
- Register returns 201 Created
- Login returns 200 with token
- Protected route with token returns 200
- Protected route without token returns 401
- Users visible in database
- Passwords start with `$2b$` (bcrypt)

### Error Signs ❌
- 500 Internal Server Error → Check logs: `docker compose logs api`
- Connection refused → Services not started: `docker compose ps`
- Database error → Restart: `docker compose restart postgres`

---

## 💾 Verify Database

After testing, check the database:

```bash
# Connect
docker compose exec postgres psql -U canvas_user -d canvas_platform

# View users
SELECT id, email, full_name, role, created_at FROM users;

# Check password is hashed
SELECT email, password_hash FROM users LIMIT 1;

# Count users
SELECT COUNT(*) FROM users;

# Exit
\q
```

---

## 📝 Expected Database Output

```
 id                                   | email              | full_name  | role     | created_at
--------------------------------------+--------------------+------------+----------+-----------
 550e8400-e29b-41d4-a716-446655440000 | test@example.com   | Test User  | customer | 2026-02-19
 550e8400-e29b-41d4-a716-446655440001 | john@example.com   | John Doe   | customer | 2026-02-19
```

Password example:
```
email               | password_hash
--------------------+-------------------------------------------------------
test@example.com    | $2b$10$xyz...abcdefghijklmnopqrstuvwxyz (not plaintext)
```

---

## 🛠️ Troubleshooting

### Services Won't Start
```bash
docker compose ps
# If not all services running:
docker compose up -d
sleep 20
```

### Backend Not Responding
```bash
docker compose logs api
# Wait for "listening on port 4000"
```

### Database Error
```bash
docker compose logs postgres
# Should show "ready to accept connections"
# If not:
docker compose restart postgres
```

### Port Already in Use
```powershell
# Windows: find what's using port 4000
netstat -ano | findstr :4000

# Kill the process or change port in docker-compose.yml
```

---

## 🎯 What Happens When You Test

1. **PowerShell Script Runs:**
   - Checks Docker is running
   - Starts all services
   - Waits for backend ready
   - Registers 2 test users
   - Tests duplicate prevention
   - Tests login success & failures
   - Tests protected routes
   - Shows summary

2. **Manual Testing:**
   - You control each step
   - See raw JSON responses
   - Can inspect each request
   - More learning

3. **Step-by-Step Guide:**
   - Detailed explanations
   - Expected responses shown
   - Troubleshooting for each test
   - Database queries included

---

## 📈 Testing Timeline

| Step | Time | What's Tested |
|------|------|---------------|
| Start services | 15s | Docker + Backend ready |
| Register users | 10s | Registration endpoint |
| Login | 5s | Token generation |
| Protected routes | 5s | JWT validation |
| Database check | 5s | Data persistence |
| **Total** | **~1 min** | **Complete auth flow** |

---

## ✅ Success Checklist

After running tests, verify:

- [ ] All tests passed (✅ or auto-script completed)
- [ ] No 500 errors
- [ ] Users created in database
- [ ] Passwords are hashed (start with $2b$)
- [ ] Token obtained from login
- [ ] Protected route accessible with token
- [ ] Protected route blocked without token
- [ ] Invalid token rejected

**All checked? Auth module is working!** 🎉

---

## 📚 Next Steps

1. **Just tested?** ✅
2. **Ready for Products API?** 🚀

To build Products API:
- Create Product entity
- Create Product service
- Create Product controller
- Add endpoints
- Test with Postman

---

## 🔑 Key Endpoints Being Tested

```
POST   /api/v1/auth/register
       → Creates user, hashes password
       → Response: User object

POST   /api/v1/auth/login  
       → Finds user, verifies password
       → Response: User + JWT token

GET    /api/v1/auth/me
       → Protected route
       → Requires: Authorization: Bearer TOKEN
       → Response: Current user
```

---

## 💻 System Status

```
Backend:       ✅ Ready
Frontend:      ✅ Ready  
Database:      ✅ Ready
Auth Module:   ✅ Ready
Docker:        ✅ Configured
Tests:         ✅ Available

Status: READY FOR TESTING 🟢
```

---

## 📞 Need Help?

**Auth not working?**
- Check: `docker compose logs api` (backend logs)
- Check: `docker compose logs postgres` (database logs)
- Restart: `docker compose restart postgres`

**Password not hashing?**
- Check bcrypt is installed: already in package.json ✅
- Check password saving: use `password_hash` column ✅

**Token not working?**
- Check: JWT_SECRET in .env
- Check: Bearer prefix in header
- Check: Token not expired

---

## 🎓 Learning from Tests

### What Auth Teaches Us:
- ✅ NestJS structure
- ✅ Database integration
- ✅ Security best practices
- ✅ JWT implementation
- ✅ Error handling
- ✅ TypeScript usage
- ✅ Testing patterns

---

**Choose your testing method and start testing!** 🚀

```
Windows? → Run .\test-auth.ps1
Mac/Linux? → Copy commands from QUICK_TEST.md
Want details? → Follow TEST_AUTH_COMPLETE.md
```

All three methods test the same thing - choose what works for you!
