# Canvas Platform - Setup Guide

## 📁 Project Structure

```
files/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── auth/        # Authentication module
│   │   ├── products/    # Products & sizes
│   │   ├── templates/   # Template definitions
│   │   ├── images/      # Image upload & processing
│   │   ├── orders/      # Order management
│   │   └── jobs/        # Print job queue
│   ├── package.json
│   ├── Dockerfile
│   ├── Dockerfile.worker
│   └── schema.sql       # Database schema with seed data
├── frontend/            # Next.js React app
│   ├── src/app/
│   ├── src/components/  # Reusable components
│   ├── src/store/       # Zustand stores
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml   # Full stack orchestration
└── README.md
```

## 🐳 Docker Services

| Service | Port | Purpose |
|---------|------|---------|
| **PostgreSQL** | 5432 | Database |
| **Redis** | 6379 | Job queue & cache |
| **MinIO** | 9000 | S3-compatible storage |
| **MinIO Console** | 9001 | S3 management UI |
| **Backend API** | 4000 | NestJS REST API |
| **Frontend** | 3000 | Next.js React app |
| **Print Worker** | - | Background job processor |

---

## 🚀 Quick Start with Docker Desktop

### 1. Install Docker Desktop (if not already installed)
- Download from [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Install and start it

### 2. Clone/Setup the Repository
```bash
cd c:\Users\bichiou\Documents\2025-2026\stage\Project\files
```

### 3. Install Dependencies Locally (for development)
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Create Environment Files
```bash
# In /backend
cp .env.example .env

# In /frontend
cp .env.example .env.local
```

### 5. Start Everything with Docker Compose
```bash
# From the project root (files/ directory)
docker compose up -d
```

This starts all 6 services. Docker will:
- ✅ Build the backend (NestJS)
- ✅ Build the frontend (Next.js)
- ✅ Initialize PostgreSQL with schema + seed data
- ✅ Start Redis, MinIO, API, Frontend, Print Worker

### 6. Check Services
```bash
# View all running containers
docker compose ps

# View logs
docker compose logs -f api           # Backend logs
docker compose logs -f frontend      # Frontend logs
docker compose logs -f postgres      # Database logs
```

### 7. Access Services
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api/v1/health
- **MinIO Console**: http://localhost:9001 (admin/minioadmin123)
- **Database**: postgres://localhost:5432 (canvas_user/canvas_secret)

---

## 📦 Database Setup

The PostgreSQL database is automatically initialized with:
- ✅ **Tables**: users, products, product_sizes, frame_options, templates, orders, order_items, uploaded_images, print_jobs
- ✅ **Seed Data**: 
  - 3 products (Canvas, Poster, Acrylic)
  - 5 canvas sizes (20x30 to 60x90 cm)
  - 4 frame options (none, black wood, white wood, natural)
  - 3 design templates (Loveflix, 3×3 Grid, Central Hero)

---

## 🛑 Stop Everything
```bash
docker compose down
```

---

## 📝 Next Steps

We're going to build feature by feature:

1. ✅ **Backend Setup** - Done! NestJS structure ready
2. ✅ **Database** - Done! Schema with seed data
3. ✅ **Docker** - Done! All services configured
4. **→ Auth Module** - JWT login/register endpoints
5. **Products API** - GET endpoints for products, sizes, templates
6. **Image Upload** - File upload → MinIO + validation
7. **Canvas Editor** - Konva integration with state management
8. **Orders** - Create/manage orders
9. **Print Jobs** - Queue system for PDF generation

---

## 🆘 Troubleshooting

**Port already in use?**
```bash
# Find what's using port 5432 (example)
netstat -ano | findstr :5432

# Change ports in docker-compose.yml if needed
```

**Database connection error?**
```bash
# Wait for postgres to be healthy
docker compose ps postgres
# Should show "(healthy)" status

# Check logs
docker compose logs postgres
```

**Need fresh database?**
```bash
docker compose down -v  # -v removes volumes
docker compose up -d    # Fresh start
```

---

**Ready to start coding? Let's build the Auth module next!** 🚀
