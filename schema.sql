-- ============================================================
-- Custom Canvas Platform - PostgreSQL Schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     VARCHAR(255),
  role          VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) UNIQUE NOT NULL,
  description   TEXT,
  base_price    NUMERIC(10,2) NOT NULL,
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Product size variants (e.g. 30x40cm, 50x70cm)
CREATE TABLE product_sizes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label         VARCHAR(50) NOT NULL,     -- "30x40"
  width_cm      NUMERIC(6,2) NOT NULL,
  height_cm     NUMERIC(6,2) NOT NULL,
  price_delta   NUMERIC(10,2) DEFAULT 0, -- added to base_price
  active        BOOLEAN DEFAULT TRUE
);

-- Frame / finish options
CREATE TABLE frame_options (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label         VARCHAR(100) NOT NULL,   -- "Black Wood Frame"
  color_hex     VARCHAR(7),              -- "#1a1a1a"
  material      VARCHAR(100),            -- "wood", "metal", "none"
  price_delta   NUMERIC(10,2) DEFAULT 0,
  active        BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- TEMPLATES
-- ============================================================
CREATE TABLE templates (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_key  VARCHAR(100) UNIQUE NOT NULL,  -- "loveflix-01", "3x3-grid"
  name          VARCHAR(255) NOT NULL,
  category      VARCHAR(100),                  -- "couple", "family", "memorial"
  thumbnail_url TEXT,
  definition    JSONB NOT NULL,                -- full slot/text definitions
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TYPE order_status AS ENUM (
  'draft',
  'pending_payment',
  'paid',
  'in_production',
  'shipped',
  'delivered',
  'cancelled'
);

CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_email     VARCHAR(255),               -- for guest checkout
  status          order_status DEFAULT 'draft',
  subtotal        NUMERIC(10,2),
  shipping        NUMERIC(10,2) DEFAULT 0,
  total           NUMERIC(10,2),
  currency        VARCHAR(3) DEFAULT 'TND',
  shipping_name   VARCHAR(255),
  shipping_addr   JSONB,                      -- {line1, line2, city, postal, country}
  payment_ref     VARCHAR(255),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products(id),
  product_size_id UUID REFERENCES product_sizes(id),
  frame_option_id UUID REFERENCES frame_options(id),
  template_id     UUID REFERENCES templates(id),
  quantity        INT DEFAULT 1,
  unit_price      NUMERIC(10,2) NOT NULL,
  design_json     JSONB NOT NULL,           -- full editor state snapshot
  preview_url     TEXT,                     -- low-res preview image
  print_file_url  TEXT,                     -- high-res print file (PDF/PNG)
  print_dpi       INT DEFAULT 300,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UPLOADED IMAGES (user uploads)
-- ============================================================
CREATE TABLE uploaded_images (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id      VARCHAR(255),             -- for guests
  original_url    TEXT NOT NULL,
  thumb_url       TEXT,
  width_px        INT NOT NULL,
  height_px       INT NOT NULL,
  file_size_bytes BIGINT,
  mime_type       VARCHAR(100),
  quality_score   NUMERIC(4,2),            -- 0-100
  dpi_ok          BOOLEAN,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRINT JOBS (worker queue mirror)
-- ============================================================
CREATE TYPE print_job_status AS ENUM (
  'queued', 'processing', 'done', 'failed'
);

CREATE TABLE print_jobs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id   UUID NOT NULL REFERENCES order_items(id),
  status          print_job_status DEFAULT 'queued',
  attempts        INT DEFAULT 0,
  error           TEXT,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_orders_user        ON orders(user_id);
CREATE INDEX idx_orders_status      ON orders(status);
CREATE INDEX idx_order_items_order  ON order_items(order_id);
CREATE INDEX idx_uploaded_user      ON uploaded_images(user_id);
CREATE INDEX idx_print_jobs_status  ON print_jobs(status);
CREATE INDEX idx_templates_key      ON templates(template_key);

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_orders_updated
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO products (name, slug, description, base_price) VALUES
  ('Canvas Print', 'canvas-print', 'Premium stretched canvas print', 29.90),
  ('Framed Poster', 'framed-poster', 'High-quality framed photo poster', 39.90),
  ('Acrylic Print', 'acrylic-print', 'Modern acrylic glass print', 59.90);

-- Sizes for Canvas Print
INSERT INTO product_sizes (product_id, label, width_cm, height_cm, price_delta)
SELECT id, '20x30', 20, 30, 0       FROM products WHERE slug = 'canvas-print' UNION ALL
SELECT id, '30x40', 30, 40, 10      FROM products WHERE slug = 'canvas-print' UNION ALL
SELECT id, '40x60', 40, 60, 20      FROM products WHERE slug = 'canvas-print' UNION ALL
SELECT id, '50x70', 50, 70, 35      FROM products WHERE slug = 'canvas-print' UNION ALL
SELECT id, '60x90', 60, 90, 55      FROM products WHERE slug = 'canvas-print';

-- Frame options
INSERT INTO frame_options (product_id, label, color_hex, material, price_delta)
SELECT id, 'No Frame',     NULL,      'none',   0   FROM products WHERE slug = 'canvas-print' UNION ALL
SELECT id, 'Black Wood',   '#1a1a1a', 'wood',   15  FROM products WHERE slug = 'canvas-print' UNION ALL
SELECT id, 'White Wood',   '#f5f5f5', 'wood',   15  FROM products WHERE slug = 'canvas-print' UNION ALL
SELECT id, 'Natural Wood', '#c8a07a', 'wood',   18  FROM products WHERE slug = 'canvas-print';

-- Template definitions
INSERT INTO templates (template_key, name, category, definition) VALUES
('loveflix-01', 'Loveflix Movie Poster', 'couple', '{
  "canvasSize": {"width": 5905, "height": 8268},
  "dpi": 300,
  "slots": [
    {"id": "img1", "x": 0, "y": 0, "w": 5905, "h": 6000, "type": "image", "required": true},
    {"id": "title", "x": 200, "y": 6100, "type": "text", "maxChars": 40, "required": true, "defaultFont": "Cinzel", "align": "center"},
    {"id": "subtitle", "x": 200, "y": 6500, "type": "text", "maxChars": 60, "required": false, "defaultFont": "Lato", "align": "center"},
    {"id": "date", "x": 200, "y": 6900, "type": "text", "maxChars": 20, "required": false, "defaultFont": "Lato", "align": "center"}
  ]
}'),
('3x3-grid', '3×3 Photo Grid', 'family', '{
  "canvasSize": {"width": 5905, "height": 5905},
  "dpi": 300,
  "slots": [
    {"id": "img1", "x": 0,    "y": 0,    "w": 1935, "h": 1935, "type": "image", "required": true},
    {"id": "img2", "x": 1985, "y": 0,    "w": 1935, "h": 1935, "type": "image", "required": true},
    {"id": "img3", "x": 3970, "y": 0,    "w": 1935, "h": 1935, "type": "image", "required": true},
    {"id": "img4", "x": 0,    "y": 1985, "w": 1935, "h": 1935, "type": "image", "required": true},
    {"id": "img5", "x": 1985, "y": 1985, "w": 1935, "h": 1935, "type": "image", "required": true},
    {"id": "img6", "x": 3970, "y": 1985, "w": 1935, "h": 1935, "type": "image", "required": false},
    {"id": "img7", "x": 0,    "y": 3970, "w": 1935, "h": 1935, "type": "image", "required": false},
    {"id": "img8", "x": 1985, "y": 3970, "w": 1935, "h": 1935, "type": "image", "required": false},
    {"id": "img9", "x": 3970, "y": 3970, "w": 1935, "h": 1935, "type": "image", "required": false}
  ]
}'),
('central-hero', 'Central Hero', 'portrait', '{
  "canvasSize": {"width": 4961, "height": 7016},
  "dpi": 300,
  "slots": [
    {"id": "img1", "x": 480, "y": 480, "w": 4000, "h": 4500, "type": "image", "required": true},
    {"id": "title", "x": 480, "y": 5100, "type": "text", "maxChars": 50, "required": true, "defaultFont": "Playfair Display", "align": "center"},
    {"id": "body",  "x": 480, "y": 5500, "type": "text", "maxChars": 150, "required": false, "defaultFont": "Lato", "align": "center"}
  ]
}');
