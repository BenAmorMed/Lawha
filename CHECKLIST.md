# ✅ Deployment & Local Setup Checklist

## 🖥️ Local Development Setup

### Prerequisites
- [ ] Docker Desktop installed and running
- [ ] Node.js 20+ installed
- [ ] Git configured
- [ ] Terminal/PowerShell ready

### Project Setup
- [x] Backend folder structure created
- [x] Frontend folder structure created
- [x] Docker services configured
- [x] Database schema prepared with seed data
- [x] Environment files (.env.example) created
- [x] Dockerfiles created for all services
- [x] docker-compose.yml fully configured

### First Time Setup (Do This Once)

```bash
# 1. Navigate to project
cd c:\Users\bichiou\Documents\2025-2026\stage\Project\files

# 2. Create environment files
cd backend && copy .env.example .env && cd ..
cd frontend && copy .env.example .env.local && cd ..

# 3. Start Docker containers
docker compose up -d

# 4. Wait for services to be healthy
docker compose ps
# All services should show "healthy" or "up"

# 5. Access services
# Frontend: http://localhost:3000
# API Health: http://localhost:4000/api/v1/health
# MinIO Console: http://localhost:9001 (admin/minioadmin123)
# Database: localhost:5432 (canvas_user/canvas_secret)
```

---

## 🔧 Development Workflow

### Option A: Run Everything in Docker (Recommended)
```bash
# Start all services
docker compose up -d

# View all logs
docker compose logs -f

# Stop when done
docker compose down
```

### Option B: Run Backend/Frontend Locally (Advanced)
```bash
# Keep Docker services running (postgres, redis, minio)
docker compose up -d postgres redis minio

# Run backend locally in another terminal
cd backend
npm install
npm run start:dev

# Run frontend locally in another terminal
cd frontend
npm install
npm run dev
```

---

## 📊 Database Access

### Via psql (Command Line)
```bash
psql -h localhost -p 5432 -U canvas_user -d canvas_platform
```

Password: `canvas_secret`

### View Seeded Data
```sql
SELECT * FROM products;
SELECT * FROM templates;
SELECT * FROM product_sizes WHERE product_id = '<id>';
SELECT * FROM frame_options WHERE product_id = '<id>';
```

### Reset Database
```bash
docker compose down -v   # Remove volumes
docker compose up -d     # Fresh database with seed data
```

---

## 🐳 Docker Commands Reference

```bash
# View all running containers
docker compose ps

# View logs for specific service
docker compose logs -f api
docker compose logs -f frontend
docker compose logs -f postgres

# View logs with filtering
docker compose logs api | grep "error"

# Enter bash shell in a container
docker compose exec api sh
docker compose exec postgres psql -U canvas_user -d canvas_platform

# Rebuild a specific service
docker compose build api
docker compose up -d api

# Stop a specific service
docker compose stop api

# View resource usage
docker stats

# Clean up everything
docker compose down -v --remove-orphans
```

---

## 🔐 Credentials & URLs

| Service | URL | Username | Password |
|---------|-----|----------|----------|
| Frontend | http://localhost:3000 | - | - |
| API | http://localhost:4000 | - | - |
| MinIO Console | http://localhost:9001 | minioadmin | minioadmin123 |
| PostgreSQL | localhost:5432 | canvas_user | canvas_secret |
| Redis | localhost:6379 | - | - |
| Database Name | - | - | canvas_platform |

---

## ⚠️ Troubleshooting

### Port Conflicts
**Problem:** "Address already in use"
```bash
# Find what's using the port
netstat -ano | findstr :5432

# Kill the process (Windows PowerShell)
Stop-Process -Id <PID> -Force

# Or change ports in docker-compose.yml
```

### Database Won't Initialize
**Solution:**
```bash
docker compose down -v
docker compose up -d postgres
docker compose logs postgres
# Wait until "ready to accept connections"
```

### Services Won't Start
**Check logs:**
```bash
docker compose logs
```

**Common issues:**
- Docker Desktop not running → Start Docker Desktop
- Insufficient disk space → Clean up: `docker system prune -a`
- Port already in use → See Port Conflicts above

### API Can't Connect to Database
**Wait longer:** Database takes ~10 seconds to initialize
```bash
docker compose logs postgres | grep "ready"
```

---

## 📈 Performance Optimization (Advanced)

### For Development (Fast rebuild)
```bash
# Build without cache
docker compose build --no-cache api

# Use volume mounts for live reload
# Already configured in docker-compose.yml for development
```

### For Production
1. Set `NODE_ENV=production` in .env
2. Update CORS origins in app.module.ts
3. Use secrets manager for credentials
4. Enable database connection pooling
5. Setup CDN for static assets

---

## 🚀 Next Phase Checklist

After setup is working:

- [ ] Auth module API endpoints built
- [ ] Products API endpoints built
- [ ] Image upload implemented
- [ ] Frontend authentication page created
- [ ] Product gallery page created
- [ ] Canvas editor page created
- [ ] Order management implemented
- [ ] Print worker tested
- [ ] End-to-end testing completed
- [ ] Deploy to staging environment

---

## 📞 Support

**Docker logs show:**
```
ERROR: service "postgres" depends on undefined service
```
→ Make sure service names match in docker-compose.yml

**Frontend can't reach API:**
```
CORS error or network error
```
→ Check NEXT_PUBLIC_API_URL in .env.local
→ Ensure backend is running: `docker compose logs api`

**Database migration failed:**
→ Check schema.sql syntax
→ View logs: `docker compose logs postgres`
→ Reset: `docker compose down -v && docker compose up -d`

---

**Ready to start? Let's build the Auth Module! 🎯**
