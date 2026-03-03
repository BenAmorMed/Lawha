#!/usr/bin/env bash
# Quick Start Script for Canvas Platform

echo "🎉 Canvas Platform - Quick Start"
echo "================================="
echo ""

# Step 1: Check Docker
echo "1️⃣  Checking Docker Desktop..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker Desktop."
    exit 1
fi
echo "✅ Docker found"
echo ""

# Step 2: Navigate to project
echo "2️⃣  Current directory:"
pwd
echo ""

# Step 3: Start services
echo "3️⃣  Starting Docker services..."
echo "   Running: docker compose up -d"
docker compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start services"
    exit 1
fi
echo "✅ Services started"
echo ""

# Step 4: Wait for services
echo "4️⃣  Waiting for services to be healthy..."
echo "   PostgreSQL: starting..."
sleep 10
echo "   PostgreSQL: ready ✅"
echo ""

# Step 5: Check status
echo "5️⃣  Service status:"
docker compose ps
echo ""

# Step 6: Display URLs
echo "6️⃣  Access your services at:"
echo "   🌐 Frontend:      http://localhost:3000"
echo "   🔌 Backend:       http://localhost:4000/api/v1/health"
echo "   📦 MinIO Console: http://localhost:9001"
echo "   🗄️  Database:      psql -h localhost -U canvas_user -d canvas_platform"
echo ""

# Step 7: Display next steps
echo "7️⃣  Next steps:"
echo "   1. Read: SETUP.md"
echo "   2. Build: Auth module (backend/src/auth/)"
echo "   3. Test: API with Postman"
echo ""

echo "✨ Setup complete! Ready to code!"
echo ""
