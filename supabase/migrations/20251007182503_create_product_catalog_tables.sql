/*
  # Catálogo de Productos - Llaves, Telemandos y Carcasas

  ## Nuevas Tablas

  ### 1. llaves (Catálogo de llaves de auto)
  - `id` (uuid, primary key)
  - `brand` (text) - Marca del auto
  - `model` (text) - Modelo del auto
  - `description` (text) - Descripción de la llave
  - `image_url` (text) - URL de la imagen
  - `price` (numeric) - Precio de la llave
  - `stock` (integer) - Stock disponible
  - `active` (boolean) - Si está disponible para venta
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. telemandos (Catálogo de telemandos/controles)
  - `id` (uuid, primary key)
  - `brand` (text) - Marca del telemando
  - `model` (text) - Modelo del telemando
  - `description` (text) - Descripción
  - `image_url` (text) - URL de la imagen
  - `price` (numeric) - Precio
  - `stock` (integer) - Stock disponible
  - `active` (boolean) - Si está disponible
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. carcasas (Catálogo de carcasas para llaves)
  - `id` (uuid, primary key)
  - `brand` (text) - Marca compatible
  - `model` (text) - Modelo compatible
  - `description` (text) - Descripción
  - `image_url` (text) - URL de la imagen
  - `price` (numeric) - Precio
  - `stock` (integer) - Stock disponible
  - `color` (text) - Color de la carcasa
  - `active` (boolean) - Si está disponible
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Seguridad
  - Lectura pública para todos los productos activos
  - Solo admins pueden crear/editar/eliminar
*/

-- Tabla de llaves
CREATE TABLE IF NOT EXISTS llaves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  model text NOT NULL,
  description text DEFAULT '',
  image_url text NOT NULL,
  price numeric(10,2) DEFAULT 0,
  stock integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE llaves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active llaves"
  ON llaves FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage llaves"
  ON llaves FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.phone = (auth.jwt()->>'phone')::text
      AND u.role = 'admin'
    )
  );

-- Tabla de telemandos
CREATE TABLE IF NOT EXISTS telemandos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  model text NOT NULL,
  description text DEFAULT '',
  image_url text NOT NULL,
  price numeric(10,2) DEFAULT 0,
  stock integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE telemandos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active telemandos"
  ON telemandos FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage telemandos"
  ON telemandos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.phone = (auth.jwt()->>'phone')::text
      AND u.role = 'admin'
    )
  );

-- Tabla de carcasas
CREATE TABLE IF NOT EXISTS carcasas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  model text NOT NULL,
  description text DEFAULT '',
  image_url text NOT NULL,
  price numeric(10,2) DEFAULT 0,
  stock integer DEFAULT 0,
  color text DEFAULT '',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE carcasas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active carcasas"
  ON carcasas FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage carcasas"
  ON carcasas FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.phone = (auth.jwt()->>'phone')::text
      AND u.role = 'admin'
    )
  );

-- Índices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_llaves_brand ON llaves(brand);
CREATE INDEX IF NOT EXISTS idx_llaves_model ON llaves(model);
CREATE INDEX IF NOT EXISTS idx_llaves_active ON llaves(active);

CREATE INDEX IF NOT EXISTS idx_telemandos_brand ON telemandos(brand);
CREATE INDEX IF NOT EXISTS idx_telemandos_model ON telemandos(model);
CREATE INDEX IF NOT EXISTS idx_telemandos_active ON telemandos(active);

CREATE INDEX IF NOT EXISTS idx_carcasas_brand ON carcasas(brand);
CREATE INDEX IF NOT EXISTS idx_carcasas_model ON carcasas(model);
CREATE INDEX IF NOT EXISTS idx_carcasas_active ON carcasas(active);

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_llaves_updated_at ON llaves;
CREATE TRIGGER update_llaves_updated_at
  BEFORE UPDATE ON llaves
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_telemandos_updated_at ON telemandos;
CREATE TRIGGER update_telemandos_updated_at
  BEFORE UPDATE ON telemandos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_carcasas_updated_at ON carcasas;
CREATE TRIGGER update_carcasas_updated_at
  BEFORE UPDATE ON carcasas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo para llaves
INSERT INTO llaves (brand, model, description, image_url, price, stock) VALUES
  ('Toyota', 'Corolla 2020-2023', 'Llave con control remoto integrado', 'https://images.unsplash.com/photo-1625116540290-2d77b1e1ec8e?w=400', 15000, 10),
  ('Ford', 'Focus 2018-2022', 'Llave inteligente proximity', 'https://images.unsplash.com/photo-1625116540290-2d77b1e1ec8e?w=400', 18000, 8),
  ('Chevrolet', 'Onix 2019-2023', 'Llave con botones', 'https://images.unsplash.com/photo-1625116540290-2d77b1e1ec8e?w=400', 12000, 15),
  ('Volkswagen', 'Gol 2017-2022', 'Llave manual con control', 'https://images.unsplash.com/photo-1625116540290-2d77b1e1ec8e?w=400', 14000, 12),
  ('Renault', 'Sandero 2020-2023', 'Llave con tarjeta', 'https://images.unsplash.com/photo-1625116540290-2d77b1e1ec8e?w=400', 16000, 7)
ON CONFLICT DO NOTHING;

-- Insertar datos de ejemplo para telemandos
INSERT INTO telemandos (brand, model, description, image_url, price, stock) VALUES
  ('Toyota', 'Universal', 'Control remoto universal programable', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 8000, 20),
  ('Ford', 'Ranger 2015-2020', 'Control original de fábrica', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 9500, 15),
  ('Chevrolet', 'S10 2018-2023', 'Control remoto con alarma', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 8500, 18),
  ('Volkswagen', 'Amarok 2016-2022', 'Control inteligente', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 10000, 12),
  ('Fiat', 'Toro 2019-2023', 'Control con 3 botones', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 7500, 25)
ON CONFLICT DO NOTHING;

-- Insertar datos de ejemplo para carcasas
INSERT INTO carcasas (brand, model, description, image_url, price, stock, color) VALUES
  ('Toyota', 'Universal', 'Carcasa de reemplazo', 'https://images.unsplash.com/photo-1625662170194-95d5a0b8a088?w=400', 3000, 30, 'Negro'),
  ('Ford', 'Focus/Fiesta', 'Carcasa con logo', 'https://images.unsplash.com/photo-1625662170194-95d5a0b8a088?w=400', 3500, 25, 'Negro'),
  ('Chevrolet', 'Onix/Cruze', 'Carcasa premium', 'https://images.unsplash.com/photo-1625662170194-95d5a0b8a088?w=400', 4000, 20, 'Gris'),
  ('Volkswagen', 'Gol/Voyage', 'Carcasa resistente', 'https://images.unsplash.com/photo-1625662170194-95d5a0b8a088?w=400', 3200, 28, 'Negro'),
  ('Renault', 'Sandero/Logan', 'Carcasa de silicona', 'https://images.unsplash.com/photo-1625662170194-95d5a0b8a088?w=400', 2500, 35, 'Azul')
ON CONFLICT DO NOTHING;