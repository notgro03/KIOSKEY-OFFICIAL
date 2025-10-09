/*
  # Recrear tablas de productos con estructura correcta
  
  1. Cambios
    - Eliminar tablas existentes
    - Recrear tablas con columna active desde el principio
    - Configurar políticas RLS correctas
*/

-- Drop existing tables
DROP TABLE IF EXISTS telemandos CASCADE;
DROP TABLE IF EXISTS llaves CASCADE;
DROP TABLE IF EXISTS carcasas CASCADE;

-- Crear tabla llaves
CREATE TABLE llaves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  model text NOT NULL,
  description text DEFAULT '',
  image_url text NOT NULL,
  price numeric(10,2) DEFAULT 0,
  stock integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  video_url text DEFAULT ''
);

-- Crear tabla telemandos
CREATE TABLE telemandos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  model text NOT NULL,
  description text DEFAULT '',
  image_url text NOT NULL,
  price numeric(10,2) DEFAULT 0,
  stock integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  video_url text DEFAULT ''
);

-- Crear tabla carcasas
CREATE TABLE carcasas (
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
  updated_at timestamptz DEFAULT now(),
  video_url text DEFAULT ''
);

-- Habilitar RLS
ALTER TABLE llaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemandos ENABLE ROW LEVEL SECURITY;
ALTER TABLE carcasas ENABLE ROW LEVEL SECURITY;

-- Crear políticas públicas simples
CREATE POLICY "Public read llaves"
  ON llaves FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Public read telemandos"
  ON telemandos FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Public read carcasas"
  ON carcasas FOR SELECT
  TO anon, authenticated
  USING (active = true);

-- Crear políticas para service role
CREATE POLICY "Service role full access llaves"
  ON llaves FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access telemandos"
  ON telemandos FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access carcasas"
  ON carcasas FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Crear índices
CREATE INDEX idx_llaves_brand ON llaves(brand);
CREATE INDEX idx_llaves_model ON llaves(model);
CREATE INDEX idx_llaves_active ON llaves(active);

CREATE INDEX idx_telemandos_brand ON telemandos(brand);
CREATE INDEX idx_telemandos_model ON telemandos(model);
CREATE INDEX idx_telemandos_active ON telemandos(active);

CREATE INDEX idx_carcasas_brand ON carcasas(brand);
CREATE INDEX idx_carcasas_model ON carcasas(model);
CREATE INDEX idx_carcasas_active ON carcasas(active);
