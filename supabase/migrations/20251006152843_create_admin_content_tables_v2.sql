/*
  # Panel de Administración - Tablas de Contenido Dinámico

  1. Nuevas Tablas
    - `admin_users` - Lista de usuarios administradores
    - `banner_gifs` - GIFs del banner principal
    - `products` - Productos y servicios
    - `plans` - Planes y precios
  
  2. Seguridad
    - Enable RLS en todas las tablas
    - Solo usuarios autenticados admin pueden modificar contenido
    - Lectura pública para contenido activo
*/

-- Tabla de usuarios admin (debe ser la primera)
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view their own admin status"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Tabla de GIFs del banner
CREATE TABLE IF NOT EXISTS banner_gifs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  alt_text text DEFAULT '',
  order_position integer NOT NULL DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE banner_gifs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active banner gifs"
  ON banner_gifs FOR SELECT
  USING (active = true);

CREATE POLICY "Authenticated admins can manage banner gifs"
  ON banner_gifs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT 'fa-box',
  category text NOT NULL,
  features jsonb DEFAULT '[]'::jsonb,
  link_url text DEFAULT '#',
  link_text text DEFAULT 'Ver más',
  order_position integer NOT NULL DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (active = true);

CREATE POLICY "Authenticated admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Tabla de planes
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  features jsonb DEFAULT '[]'::jsonb,
  highlight boolean DEFAULT false,
  order_position integer NOT NULL DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
  ON plans FOR SELECT
  USING (active = true);

CREATE POLICY "Authenticated admins can manage plans"
  ON plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_banner_gifs_active_order ON banner_gifs(active, order_position);
CREATE INDEX IF NOT EXISTS idx_products_active_order ON products(active, order_position);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_plans_active_order ON plans(active, order_position);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_banner_gifs_updated_at ON banner_gifs;
CREATE TRIGGER update_banner_gifs_updated_at
  BEFORE UPDATE ON banner_gifs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos iniciales de GIFs del banner
INSERT INTO banner_gifs (url, alt_text, order_position) VALUES
  ('https://media.giphy.com/media/3o6Zt6fzS6qEbLhKWQ/giphy.gif', 'Persona perdiendo llaves del auto', 1),
  ('https://media.giphy.com/media/l0HlQXlQ3nHyLMvte/giphy.gif', 'Buscando llaves', 2),
  ('https://media.giphy.com/media/xT8qBsOjMOcdeGJIU8/giphy.gif', 'Control remoto del auto', 3),
  ('https://media.giphy.com/media/l3vR85PnGsBwu1PFK/giphy.gif', 'Cerrajero profesional', 4),
  ('https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif', 'Seguridad de auto', 5)
ON CONFLICT DO NOTHING;

-- Insertar datos iniciales de productos
INSERT INTO products (title, description, icon, category, features, link_url, link_text, order_position) VALUES
  (
    'Telemandos',
    'Controles remotos originales y alternativos para todo tipo de vehículos. Programación profesional incluida.',
    'fa-car',
    'telemandos',
    '["Telemandos originales y alternativos", "Más de 1000 modelos disponibles", "Programación incluida", "Garantía de funcionamiento", "Servicio express disponible"]'::jsonb,
    '/pages/telemandos.html',
    'Ver catálogo completo',
    1
  ),
  (
    'Llaves',
    'Amplia gama de llaves de seguridad y copias certificadas para todo tipo de cerraduras.',
    'fa-key',
    'llaves',
    '["Llaves codificadas de alta seguridad", "Llaves de puntos y multipuntos", "Llaves magnéticas y de proximidad", "Duplicados certificados", "Servicio Especializado"]'::jsonb,
    '/pages/llaves.html',
    'Explorar llaves',
    2
  ),
  (
    'Carcasas',
    'Carcasas de repuesto originales y alternativas para mandos de todas las marcas.',
    'fa-shield-alt',
    'carcasas',
    '["Carcasas originales de fábrica", "Alternativas de alta calidad", "Compatibles con todas las marcas", "Instalación profesional", "Amplio stock disponible"]'::jsonb,
    '/pages/carcasas.html',
    'Ver modelos',
    3
  ),
  (
    'Accesorios',
    'Complementos y accesorios profesionales para el cuidado y mantenimiento de tus llaves.',
    'fa-tools',
    'accesorios',
    '["Fundas protectoras premium", "Llaveros de seguridad", "Baterías certificadas", "Productos de mantenimiento", "Accesorios de personalización"]'::jsonb,
    '/pages/accesorios.html',
    'Descubrir más',
    4
  )
ON CONFLICT DO NOTHING;