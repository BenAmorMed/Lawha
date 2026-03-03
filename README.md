# 🖼️ Custom Canvas / Personalized Print Platform

Full-stack personalized print platform — from browser editor to print-ready PDF.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        BROWSER                               │
│  Next.js 14 + React 18                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐ │
│  │  Template   │  │   Konva.js  │  │   Zustand Store      │ │
│  │  Gallery    │  │   Canvas    │  │   (editor state)     │ │
│  └─────────────┘  └─────────────┘  └──────────────────────┘ │
└─────────────────────────┬────────────────────────────────────┘
                          │ REST / multipart
┌─────────────────────────▼────────────────────────────────────┐
│                   API GATEWAY (NestJS)                        │
│  /api/v1/                                                     │
│  ├── auth/         JWT login + register                       │
│  ├── products/     product catalog + sizes + frames           │
│  ├── templates/    template definitions                       │
│  ├── images/       upload + validate + quality-check          │
│  └── orders/       create + pay + status                      │
└───────┬─────────────────────────────────────┬─────────────────┘
        │                                     │
┌───────▼──────────┐                ┌─────────▼──────────────────┐
│   PostgreSQL 16  │                │   Redis + Bull Queue        │
│   - users        │                │   - print_jobs              │
│   - products     │                │   - email_notifications     │
│   - templates    │                └─────────┬──────────────────┘
│   - orders       │                          │
│   - order_items  │                ┌─────────▼──────────────────┐
│   - print_jobs   │                │   Print Worker (NestJS)     │
│   - uploads      │                │   - node-canvas render      │
└──────────────────┘                │   - Sharp processing        │
                                    │   - PDFKit output           │
┌───────────────────────────────────▼──────────────────────────┐
│              Object Storage (S3 / MinIO)                      │
│  uploads/originals/   — user photos (private)                 │
│  uploads/thumbs/      — 400px thumbnails (private)            │
│  previews/            — low-res design previews (CDN)         │
│  print-files/         — 300 DPI PDF/PNG/TIFF (private)        │
└───────────────────────────────────────────────────────────────┘
```

---

## Database Schema (ERD)

```
users ──────────────────────────────────────────────────────┐
  id, email, password_hash, full_name, role                  │
                                                             │
products ──────────── product_sizes                          │
  id, name, slug,       id, product_id, label,              │
  base_price            width_cm, height_cm, price_delta     │
       │                                                     │
       └──── frame_options                                   │
               id, product_id, label, color_hex, price_delta │
                                                             │
templates                                                    │
  id, template_key, name, category, definition(JSONB)        │
                                                             │
orders ◄──────────────────────────────────────────── users  │
  id, user_id, guest_email, status (enum), total             │
  shipping_name, shipping_addr(JSONB), payment_ref           │
       │                                                     │
       └──── order_items                                     │
               id, order_id, product_id, product_size_id,   │
               frame_option_id, template_id, quantity,       │
               unit_price, design_json(JSONB),               │
               preview_url, print_file_url                   │
                     │                                       │
                     └──── print_jobs                        │
                             id, order_item_id, status(enum) │
                             attempts, error, completed_at   │
                                                             │
uploaded_images                                              │
  id, user_id, session_id, original_url, thumb_url           │
  width_px, height_px, quality_score, dpi_ok                 │
```

---

## User Flow

```
1. Visit → Select Product (canvas, poster, acrylic)
      ↓
2. Choose Template (Loveflix, Grid, Hero, Timeline…)
      ↓
3. Design Studio:
   a. Upload photos → DPI validation → assign to slots
   b. Edit text fields (font, size, color, alignment)
   c. Choose size (20×30 → 60×90 cm)
   d. Choose frame (none, black wood, white wood…)
      ↓
4. Checkout:
   - Design serialized as JSON
   - Preview screenshot generated
   - Order + OrderItems created in DB
   - PrintJob queued
      ↓
5. Payment → order status: paid
      ↓
6. Print Worker:
   - Loads design JSON
   - Re-renders at full DPI (300 DPI)
   - Outputs PDF (CMYK) or PNG/TIFF
   - Uploads to S3
      ↓
7. Admin downloads print file → physical production → ships
```

---

## DPI Formula

```
Required width (px)  = (print_width_cm  / 2.54) × DPI
Required height (px) = (print_height_cm / 2.54) × DPI

Example: 50×70 cm at 300 DPI
  Width  = (50  / 2.54) × 300 = 5,906 px
  Height = (70  / 2.54) × 300 = 8,268 px
```

If uploaded image is below required pixels → checkout blocked with error.
If 15% above minimum → warning shown.

---

## Project Structure

```
canvas-platform/
├── backend/
│   ├── src/
│   │   ├── main.ts                    — NestJS bootstrap
│   │   ├── app.module.ts              — Root module
│   │   └── modules/
│   │       ├── auth/                  — JWT auth
│   │       ├── products/              — Product catalog API
│   │       ├── templates/             — Template registry API
│   │       ├── orders/
│   │       │   ├── orders.service.ts  — Order creation + pricing
│   │       │   └── print-worker.ts    — High-DPI render engine
│   │       └── images/
│   │           ├── images.service.ts  — Upload + DPI validation
│   │           └── images.controller.ts
│   ├── schema.sql                     — Full PostgreSQL schema + seed
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── editor/page.tsx        — Full editor layout
│   │   ├── components/editor/
│   │   │   ├── CanvasEditor.tsx       — Konva.js canvas
│   │   │   ├── ImageUploadPanel.tsx   — Drag-drop + quality UI
│   │   │   └── TextPanel.tsx          — Text editing UI
│   │   └── store/
│   │       └── editorStore.ts         — Zustand global state
│   └── package.json
│
├── docker-compose.yml                 — Full stack orchestration
├── .env.example                       — Environment variables
└── README.md
```

---

## Getting Started

```bash
# 1. Clone and install
git clone <repo>
cd canvas-platform

# 2. Configure environment
cp .env.example .env
# Edit .env with your values

# 3. Start all services
docker-compose up -d

# 4. Apply database schema (auto-applied via docker init)
# Or manually: psql $DATABASE_URL -f backend/schema.sql

# 5. Install frontend deps and start dev server
cd frontend && npm install && npm run dev

# 6. Install backend deps and start API
cd backend && npm install && npm run start:dev
```

**Services:**
- Frontend: http://localhost:3000
- API: http://localhost:4000
- Swagger: http://localhost:4000/api/docs
- MinIO Console: http://localhost:9001

---

## Template JSON Format

```json
{
  "templateId": "loveflix-01",
  "canvasSize": { "width": 5905, "height": 8268 },
  "dpi": 300,
  "slots": [
    {
      "id": "img1", "type": "image",
      "x": 0, "y": 0, "w": 5905, "h": 6000,
      "required": true
    },
    {
      "id": "title", "type": "text",
      "x": 200, "y": 6100,
      "maxChars": 40, "required": true,
      "defaultFont": "Cinzel", "align": "center"
    }
  ]
}
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript |
| Canvas Editor | Konva.js + react-konva |
| State Management | Zustand + immer |
| Styling | Tailwind CSS |
| Backend | NestJS (Node.js) |
| Database | PostgreSQL 16 |
| Job Queue | Bull + Redis |
| Object Storage | AWS S3 / MinIO |
| Image Processing | Sharp, node-canvas |
| PDF Generation | PDFKit |
| Auth | JWT + Passport.js |
| DevOps | Docker Compose |
