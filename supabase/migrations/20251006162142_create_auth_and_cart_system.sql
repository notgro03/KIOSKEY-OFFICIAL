/*
  # Sistema de Autenticación y Carrito de Compras - Kioskeys

  ## Nuevas Tablas

  ### 1. users (Usuarios del sistema web)
  - `id` (uuid, primary key)
  - `phone` (text, unique) - Número de teléfono internacional
  - `name` (text) - Nombre del usuario
  - `email` (text, optional) - Email opcional
  - `role` (text) - Rol: 'user' o 'admin'
  - `active_plan_id` (uuid, optional) - Plan activo del usuario
  - `profile_photo_url` (text, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. otp_codes (Códigos de verificación OTP)
  - `id` (uuid, primary key)
  - `phone` (text) - Teléfono al que se envió el código
  - `code` (text) - Código de 6 dígitos
  - `expires_at` (timestamptz) - Fecha de expiración (5 minutos)
  - `attempts` (integer) - Intentos de verificación (máx 3)
  - `used` (boolean) - Si ya fue usado
  - `created_at` (timestamptz)

  ### 3. user_addresses (Direcciones de envío)
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `alias` (text) - Nombre de la dirección (ej: "Casa", "Trabajo")
  - `street` (text) - Calle y número
  - `city` (text) - Ciudad
  - `province` (text) - Provincia
  - `postal_code` (text) - Código postal
  - `phone` (text) - Teléfono de contacto
  - `is_default` (boolean) - Si es la dirección principal
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. cart (Carrito de compras)
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `product_id` (uuid) - ID del producto (de llaves, carcasas, o planes)
  - `product_type` (text) - Tipo: 'llave', 'carcasa', 'plan', 'accesorio'
  - `quantity` (integer) - Cantidad
  - `variant_data` (jsonb) - Datos de variante: marca, modelo, color, etc.
  - `price_snapshot` (numeric) - Precio al momento de agregar
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. orders (Pedidos)
  - `id` (uuid, primary key)
  - `order_number` (text, unique) - Número de orden generado
  - `user_id` (uuid, foreign key)
  - `items` (jsonb) - Items del pedido
  - `subtotal` (numeric) - Subtotal antes de descuentos
  - `discount` (numeric) - Descuento aplicado
  - `shipping_cost` (numeric) - Costo de envío
  - `total` (numeric) - Total final
  - `status` (text) - Estado: pending, processing, shipped, delivered, cancelled
  - `payment_method` (text) - Método: mercadopago, transfer, in_store
  - `payment_status` (text) - Estado del pago: pending, paid, failed
  - `payment_reference` (text) - ID de transacción o comprobante
  - `shipping_address` (jsonb) - Dirección de envío
  - `notes` (text) - Notas especiales
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. cart_products (Catálogo de productos para carrito)
  - `id` (uuid, primary key)
  - `type` (text) - Tipo: llave, carcasa, plan, accesorio
  - `name` (text) - Nombre del producto
  - `description` (text) - Descripción
  - `brand` (text, optional) - Marca
  - `model` (text, optional) - Modelo
  - `price` (numeric) - Precio
  - `stock` (integer) - Stock disponible
  - `images` (jsonb) - Array de URLs de imágenes
  - `category` (text) - Categoría
  - `active` (boolean) - Si está disponible
  - `metadata` (jsonb) - Datos adicionales
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 7. notification_preferences (Preferencias de notificaciones)
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `order_updates` (boolean) - Notificaciones de pedidos
  - `promotions` (boolean) - Notificaciones de promociones
  - `cart_reminders` (boolean) - Recordatorios de carrito
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 8. notifications_log (Log de notificaciones enviadas)
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `type` (text) - Tipo de notificación
  - `phone` (text) - Teléfono destino
  - `message` (text) - Mensaje enviado
  - `status` (text) - Estado: sent, failed, pending
  - `error_message` (text, optional) - Error si falló
  - `created_at` (timestamptz)

  ## Seguridad (RLS)
  - Todas las tablas con RLS habilitado
  - Usuarios solo ven sus propios datos
  - Admins ven todo
  - Lectura pública solo en cart_products activos
*/

-- Tabla de usuarios web
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL,
  name text DEFAULT '',
  email text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  active_plan_id uuid,
  profile_photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = (SELECT id FROM users WHERE phone = (auth.jwt()->>'phone')::text));

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = (SELECT id FROM users WHERE phone = (auth.jwt()->>'phone')::text))
  WITH CHECK (id = (SELECT id FROM users WHERE phone = (auth.jwt()->>'phone')::text));

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.phone = (auth.jwt()->>'phone')::text
      AND u.role = 'admin'
    )
  );

-- Tabla de códigos OTP
CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer DEFAULT 0,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "OTP codes are private"
  ON otp_codes FOR ALL
  USING (false);

-- Tabla de direcciones de usuario
CREATE TABLE IF NOT EXISTS user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alias text DEFAULT '',
  street text NOT NULL,
  city text NOT NULL,
  province text NOT NULL,
  postal_code text DEFAULT '',
  phone text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own addresses"
  ON user_addresses FOR SELECT
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE phone = (auth.jwt()->>'phone')::text));

CREATE POLICY "Users can manage their own addresses"
  ON user_addresses FOR ALL
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE phone = (auth.jwt()->>'phone')::text))
  WITH CHECK (user_id = (SELECT id FROM users WHERE phone = (auth.jwt()->>'phone')::text));

-- Tabla de carrito
CREATE TABLE IF NOT EXISTS cart (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL,
  product_type text NOT NULL CHECK (product_type IN ('llave', 'carcasa', 'plan', 'accesorio')),
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  variant_data jsonb DEFAULT '{}'::jsonb,
  price_snapshot numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart"
  ON cart FOR SELECT
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE phone = (auth.jwt()->>'phone')::text));

CREATE POLICY "Users can manage their own cart"
  ON cart FOR ALL
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE phone = (auth.jwt()->>'phone')::text))
  WITH CHECK (user_id = (SELECT id FROM users WHERE phone = (auth.jwt()->>'phone')::text));

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) DEFAULT 0,
  shipping_cost numeric(10,2) DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method text CHECK (payment_method IN ('mercadopago', 'transfer', 'in_store')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_reference text,
  shipping_address jsonb DEFAULT '{}'::jsonb,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE phone = (auth.jwt()->>'phone')::text));

CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT id FROM users WHERE phone = (auth.jwt()->>'phone')::text));

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.phone = (auth.jwt()->>'phone')::text
      AND u.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.phone = (auth.jwt()->>'phone')::text
      AND u.role = 'admin'
    )
  );

-- Tabla de productos para carrito
CREATE TABLE IF NOT EXISTS cart_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('llave', 'carcasa', 'plan', 'accesorio')),
  name text NOT NULL,
  description text DEFAULT '',
  brand text,
  model text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  stock integer DEFAULT 0,
  images jsonb DEFAULT '[]'::jsonb,
  category text DEFAULT '',
  active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cart_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON cart_products FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage products"
  ON cart_products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.phone = (auth.jwt()->>'phone')::text
      AND u.role = 'admin'
    )
  );

-- Tabla de preferencias de notificaciones
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_updates boolean DEFAULT true,
  promotions boolean DEFAULT true,
  cart_reminders boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON notification_preferences FOR SELECT
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE phone = (auth.jwt()->>'phone')::text));

CREATE POLICY "Users can manage their own preferences"
  ON notification_preferences FOR ALL
  TO authenticated
  USING (user_id = (SELECT id FROM users WHERE phone = (auth.jwt()->>'phone')::text))
  WITH CHECK (user_id = (SELECT id FROM users WHERE phone = (auth.jwt()->>'phone')::text));

-- Tabla de log de notificaciones
CREATE TABLE IF NOT EXISTS notifications_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  type text NOT NULL,
  phone text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view notification logs"
  ON notifications_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.phone = (auth.jwt()->>'phone')::text
      AND u.role = 'admin'
    )
  );

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone ON otp_codes(phone, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product ON cart(product_id, product_type);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_cart_products_type ON cart_products(type, active);
CREATE INDEX IF NOT EXISTS idx_cart_products_brand ON cart_products(brand);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON user_addresses(user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_addresses_updated_at ON user_addresses;
CREATE TRIGGER update_user_addresses_updated_at
  BEFORE UPDATE ON user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_updated_at ON cart;
CREATE TRIGGER update_cart_updated_at
  BEFORE UPDATE ON cart
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_products_updated_at ON cart_products;
CREATE TRIGGER update_cart_products_updated_at
  BEFORE UPDATE ON cart_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para generar número de orden único
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_number text;
  done boolean := false;
BEGIN
  WHILE NOT done LOOP
    new_number := 'KK' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_number) THEN
      done := true;
    END IF;
  END LOOP;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar códigos OTP expirados (se puede ejecutar con cron)
CREATE OR REPLACE FUNCTION cleanup_expired_otp()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_codes
  WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;