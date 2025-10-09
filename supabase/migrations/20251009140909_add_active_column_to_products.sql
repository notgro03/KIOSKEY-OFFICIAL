/*
  # Add active column to product tables
  
  1. Changes
    - Add active column to llaves, telemandos, and carcasas tables
    - Set default value to true
    - Update all existing records to active = true
*/

-- Add active column to llaves
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'llaves' AND column_name = 'active'
  ) THEN
    ALTER TABLE llaves ADD COLUMN active boolean DEFAULT true;
  END IF;
END $$;

-- Add active column to telemandos
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'telemandos' AND column_name = 'active'
  ) THEN
    ALTER TABLE telemandos ADD COLUMN active boolean DEFAULT true;
  END IF;
END $$;

-- Add active column to carcasas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'carcasas' AND column_name = 'active'
  ) THEN
    ALTER TABLE carcasas ADD COLUMN active boolean DEFAULT true;
  END IF;
END $$;

-- Update all existing records to be active
UPDATE llaves SET active = true WHERE active IS NULL;
UPDATE telemandos SET active = true WHERE active IS NULL;
UPDATE carcasas SET active = true WHERE active IS NULL;

-- Re-enable RLS
ALTER TABLE telemandos ENABLE ROW LEVEL SECURITY;
ALTER TABLE llaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE carcasas ENABLE ROW LEVEL SECURITY;

-- Drop old restrictive policies if they exist
DROP POLICY IF EXISTS "View active telemandos" ON telemandos;
DROP POLICY IF EXISTS "View active llaves" ON llaves;
DROP POLICY IF EXISTS "View active carcasas" ON carcasas;
DROP POLICY IF EXISTS "Anyone can view telemandos" ON telemandos;
DROP POLICY IF EXISTS "Anyone can view llaves" ON llaves;
DROP POLICY IF EXISTS "Anyone can view carcasas" ON carcasas;

-- Create simple public view policies
CREATE POLICY "Public can view all telemandos"
  ON telemandos
  FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Public can view all llaves"
  ON llaves
  FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Public can view all carcasas"
  ON carcasas
  FOR SELECT
  TO anon, authenticated
  USING (active = true);
