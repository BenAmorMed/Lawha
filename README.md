# Lawha
🖼️ Lawha — self-hostable personalized print platform. Next.js editor · NestJS API · PostgreSQL · Bull print queue · S3 storage · 300 DPI PDF output.
<div align="center">

<br />

```
██╗      █████╗ ██╗    ██╗██╗  ██╗ █████╗
██║     ██╔══██╗██║    ██║██║  ██║██╔══██╗
██║     ███████║██║ █╗ ██║███████║███████║
██║     ██╔══██║██║███╗██║██╔══██║██╔══██║
███████╗██║  ██║╚███╔███╔╝██║  ██║██║  ██║
╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝
```

### **لوحة** · Where memories become wall art.

🖼️ Self-hostable personalized print platform — design custom canvas & framed prints in-browser, validate image quality at 300 DPI, and generate print-ready PDF files automatically.

<br />

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=flat-square&logo=nestjs)](https://nestjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<br />

</div>

---

## ✨ What is Lawha?

**Lawha** (لوحة — Arabic for "canvas" or "painting") is a full-stack platform that lets customers design fully personalized print products — canvas prints, framed posters, acrylic panels — directly in the browser, with zero design skills required.

From photo upload to print-ready PDF, everything is handled automatically:

- 📸 **Upload photos** — drag & drop, instant quality validation
- 🎨 **Design in real time** — Konva.js canvas with drag, crop, scale, rotate
- ✍️ **Add custom text** — fonts, colors, sizes, alignment
- 📐 **Choose size & frame** — from 20×30cm to 60×90cm
- ✅ **DPI enforced** — low-res images blocked before checkout
- 🖨️ **Automatic print file** — 300 DPI PDF generated in background
- 📦 **Admin dashboard** — download, fulfill, and ship orders

---

## 🖼️ Screenshots

| Editor Studio | Template Gallery | Admin Orders |
|:---:|:---:|:---:|
| ![Editor](https://placehold.co/320x200/1a1a2e/818cf8?text=Canvas+Editor) | ![Templates](https://placehold.co/320x200/1a1a2e/34d399?text=Template+Gallery) | ![Admin](https://placehold.co/320x200/1a1a2e/f472b6?text=Admin+Dashboard) |

> 📷 Replace placeholders with real screenshots once the app is running.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     BROWSER                             │
│   Next.js 14  ·  Konva.js Canvas  ·  Zustand Store     │
└───────────────────────┬─────────────────────────────────┘
                        │ REST API
┌───────────────────────▼─────────────────────────────────┐
│              NestJS API Gateway (:4000)                  │
│   /auth  ·  /products  ·  /templates  ·  /images        │
│   /orders  ·  /admin                                    │
└────────┬──────────────────────────────┬─────────────────┘
         │                              │
┌────────▼────────┐           ┌─────────▼──────────────┐
│  PostgreSQL 16  │           │  Redis + Bull Queue     │
│  (main store)   │           │  (print jobs)           │
└─────────────────┘           └─────────┬───────────────┘
                                        │
                              ┌─────────▼───────────────┐
                              │     Print Worker         │
                              │  node-canvas · Sharp     │
                              │  PDFKit · 300 DPI        │
                              └─────────┬───────────────┘
                                        │
                              ┌─────────▼───────────────┐
                              │   S3 / MinIO Storage     │
                              │  originals · thumbs      │
                              │  previews · print-files  │
                              └─────────────────────────┘
```

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Canvas Editor** | Konva.js + react-konva |
| **State Management** | Zustand + Immer |
| **Styling** | Tailwind CSS |
| **Backend** | NestJS (Node.js), TypeScript |
| **Database** | PostgreSQL 16 + TypeORM |
| **Job Queue** | Bull + Redis 7 |
| **Object Storage** | AWS S3 / MinIO (self-hosted) |
| **Image Processing** | Sharp, node-canvas |
| **PDF Generation** | PDFKit |
| **Authentication** | JWT + Passport.js |
| **API Docs** | Swagger / OpenAPI |
| **DevOps** | Docker Compose, Nginx |

---

## 📦 Project Structure

```
lawha/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # JWT authentication
│   │   │   ├── products/       # Product catalog API
│   │   │   ├── templates/      # Template registry
│   │   │   ├── images/         # Upload + DPI validation
│   │   │   └── orders/         # Orders + print worker
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── schema.sql              # Full PostgreSQL schema
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── editor/         # Editor page
│   │   ├── components/editor/
│   │   │   ├── CanvasEditor.tsx      # Konva.js canvas
│   │   │   ├── ImageUploadPanel.tsx  # Drag-drop + quality UI
│   │   │   └── TextPanel.tsx         # Text editing panel
│   │   └── store/
│   │       └── editorStore.ts  # Zustand global state
│   └── package.json
│
├── docker-compose.yml          # Full stack orchestration
├── .env.example                # Environment variables
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites

- [Docker](https://docker.com) & Docker Compose
- Node.js 20+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/your-username/lawha.git
cd lawha
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your values (JWT secret, S3 credentials, etc.)
```

### 3. Start all services

```bash
docker-compose up -d
```

This starts: PostgreSQL, Redis, MinIO, API, Frontend, and Print Worker.

### 4. Apply database schema

```bash
# Schema is auto-applied via Docker init scripts
# Or manually:
docker exec -i lawha_postgres psql -U canvas_user -d canvas_platform < backend/schema.sql
```

### 5. Open the app

| Service | URL |
|---------|-----|
| 🎨 Frontend | http://localhost:3000 |
| ⚙️ API | http://localhost:4000 |
| 📖 Swagger Docs | http://localhost:4000/api/docs |
| 🪣 MinIO Console | http://localhost:9001 |

---

## 🔧 Development Setup

```bash
# Backend
cd backend
npm install
npm run start:dev        # Starts on :4000 with hot reload

# Frontend (in a new terminal)
cd frontend
npm install
npm run dev              # Starts on :3000 with hot reload
```

---

## 🖨️ DPI Formula

Lawha enforces print quality using this formula before checkout:

```
Required Width  (px) = (print_width_cm  / 2.54) × DPI
Required Height (px) = (print_height_cm / 2.54) × DPI
```

**Example** — 50×70 cm at 300 DPI:
```
Width  = (50 / 2.54) × 300 = 5,906 px  ✓
Height = (70 / 2.54) × 300 = 8,268 px  ✓
```

Images below the required resolution show a warning or block checkout entirely.

---

## 🎨 Template System

Templates are defined as JSON slot definitions stored in the database:

```json
{
  "templateId": "loveflix-01",
  "canvasSize": { "width": 5905, "height": 8268 },
  "dpi": 300,
  "slots": [
    { "id": "img1", "type": "image", "x": 0, "y": 0, "w": 5905, "h": 6000, "required": true },
    { "id": "title", "type": "text", "maxChars": 40, "required": true, "defaultFont": "Cinzel" }
  ]
}
```

**Built-in templates:**

| Template | Slots | Category |
|----------|-------|----------|
| Loveflix Movie Poster | 1 image + 3 text | Couple |
| 3×3 Photo Grid | 9 images | Family |
| Central Hero | 1 image + 2 text | Portrait |
| Vertical Timeline | 4 images + text | Memorial |

---

## 🗄️ Database Schema

```
users ──────────────────────── orders ──────── order_items
products ── product_sizes              └─────── print_jobs
         └── frame_options
templates
uploaded_images
```

Full schema with indexes, triggers, and seed data: [`backend/schema.sql`](backend/schema.sql)

---

## 🌐 API Reference

Full interactive docs available at `/api/docs` when running locally.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Login → JWT token |
| `GET` | `/api/v1/products` | List all products |
| `GET` | `/api/v1/templates` | List templates by category |
| `POST` | `/api/v1/images/upload` | Upload + validate image |
| `POST` | `/api/v1/orders` | Create order |
| `GET` | `/api/v1/orders/:id` | Get order details |
| `POST` | `/api/v1/orders/:id/pay` | Confirm payment |
| `GET` | `/api/v1/admin/orders` | Admin — list all orders |
| `GET` | `/api/v1/admin/orders/:id/print-file` | Download print file |

---

## 🔐 Environment Variables

```bash
# App
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL=postgresql://canvas_user:secret@localhost:5432/canvas_platform

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_32_char_minimum_secret_here
JWT_EXPIRES_IN=7d

# S3 / MinIO
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin123
AWS_REGION=eu-west-1
S3_BUCKET=lawha
S3_ENDPOINT=http://localhost:9000   # Remove for real AWS S3

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

## 🗺️ Roadmap

- [x] Canvas editor with Konva.js
- [x] Image upload + DPI validation
- [x] Template system (JSON slot definitions)
- [x] Order creation + print job queue
- [x] 300 DPI PDF print file generation
- [x] Admin dashboard
- [ ] Mobile-optimized editor
- [ ] AI-powered layout suggestions
- [ ] CMYK soft-proofing
- [ ] Multi-language support (AR / FR / EN)
- [ ] Storefront with product catalog page
- [ ] Customer account + order history

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Commit with conventional commits
git commit -m "feat: add mobile editor support"

# Push and open a PR
git push origin feature/your-feature-name
```

---

## 📄 License

MIT © 2026 — [Mohamed Ben Amor](https://github.com/BenAmorMed)

---

<div align="center">

Built with ❤️ in Tunisia 🇹🇳

**[لوحة · Lawha](https://github.com/BenAmorMed/Lawha)**

</div>
