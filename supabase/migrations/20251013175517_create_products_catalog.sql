/*
  # Catálogo de Productos Kioskeys
  
  ## Descripción
  Crea el sistema de catálogo de productos para llaves, telemandos, carcasas y accesorios.
  
  ## Tablas Creadas
  
  ### 1. `product_categories`
  Categorías de productos (llaves, telemandos, carcasas, accesorios)
  - `id` (uuid, PK): Identificador único
  - `name` (text): Nombre de la categoría
  - `slug` (text): Slug para URLs
  - `description` (text): Descripción de la categoría
  - `icon` (text): Icono FontAwesome
  - `display_order` (integer): Orden de visualización
  - `created_at` (timestamptz): Fecha de creación
  
  ### 2. `products`
  Productos del catálogo
  - `id` (uuid, PK): Identificador único
  - `category_id` (uuid, FK): Referencia a categoría
  - `title` (text): Título del producto
  - `description` (text): Descripción del producto
  - `image_url` (text): URL de la imagen principal
  - `price` (numeric): Precio del producto
  - `stock` (integer): Stock disponible
  - `is_active` (boolean): Producto activo/visible
  - `brand` (text): Marca del producto
  - `model` (text): Modelo del producto
  - `compatibility` (jsonb): Compatibilidad con vehículos
  - `features` (jsonb): Características del producto
  - `display_order` (integer): Orden de visualización
  - `created_at` (timestamptz): Fecha de creación
  - `updated_at` (timestamptz): Fecha de actualización
  
  ## Seguridad
  - RLS habilitado en todas las tablas
  - Políticas para lectura pública de productos activos
  - Políticas para gestión de productos solo para usuarios autenticados (admin)
*/

-- Crear tabla de categorías
CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES product_categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text,
  price numeric(10,2),
  stock integer DEFAULT 0,
  is_active boolean DEFAULT true,
  brand text,
  model text,
  compatibility jsonb DEFAULT '[]'::jsonb,
  features jsonb DEFAULT '[]'::jsonb,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_display_order ON products(display_order);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON product_categories(slug);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Políticas para product_categories
-- Lectura pública de todas las categorías
CREATE POLICY "Categorías visibles para todos"
  ON product_categories
  FOR SELECT
  TO public
  USING (true);

-- Solo usuarios autenticados pueden gestionar categorías
CREATE POLICY "Solo admin puede insertar categorías"
  ON product_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Solo admin puede actualizar categorías"
  ON product_categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Solo admin puede eliminar categorías"
  ON product_categories
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para products
-- Lectura pública solo de productos activos
CREATE POLICY "Productos activos visibles para todos"
  ON products
  FOR SELECT
  TO public
  USING (is_active = true);

-- Usuarios autenticados pueden ver todos los productos
CREATE POLICY "Admin puede ver todos los productos"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

-- Solo usuarios autenticados pueden gestionar productos
CREATE POLICY "Solo admin puede insertar productos"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Solo admin puede actualizar productos"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Solo admin puede eliminar productos"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Insertar categorías por defecto
INSERT INTO product_categories (name, slug, description, icon, display_order) VALUES
  ('Llaves', 'llaves', 'Llaves codificadas y copias para vehículos', 'fa-key', 1),
  ('Telemandos', 'telemandos', 'Controles remotos originales y compatibles', 'fa-car', 2),
  ('Carcasas', 'carcasas', 'Carcasas de repuesto para llaves', 'fa-shield-alt', 3),
  ('Accesorios', 'accesorios', 'Baterías y accesorios para llaves', 'fa-tools', 4)
ON CONFLICT (slug) DO NOTHING;