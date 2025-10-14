-- Create banner_videos table
CREATE TABLE IF NOT EXISTS banner_videos (
  id SERIAL PRIMARY KEY,
  title TEXT,
  url TEXT NOT NULL,
  order_num INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table if not exists
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  brand_id INTEGER REFERENCES brands(id),
  price DECIMAL(10,2),
  description TEXT,
  image TEXT,
  features JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE banner_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy for banner_videos
CREATE POLICY "Enable read access for all users" ON banner_videos
  FOR SELECT USING (active = true);

-- Policy for products
CREATE POLICY "Enable read access for all users" ON products
  FOR SELECT USING (active = true);