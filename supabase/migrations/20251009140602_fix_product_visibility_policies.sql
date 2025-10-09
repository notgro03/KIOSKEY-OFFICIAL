/*
  # Fix Product Visibility Policies
  
  1. Changes
    - Drop restrictive view policies
    - Create new permissive policies that allow everyone to view all products
    - Products should be public and visible to all users (authenticated and anonymous)
*/

-- Drop old restrictive policies
DROP POLICY IF EXISTS "View active telemandos" ON telemandos;
DROP POLICY IF EXISTS "View active llaves" ON llaves;
DROP POLICY IF EXISTS "View active carcasas" ON carcasas;

-- Create new permissive policies for viewing all products
CREATE POLICY "Anyone can view telemandos"
  ON telemandos
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view llaves"
  ON llaves
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view carcasas"
  ON carcasas
  FOR SELECT
  USING (true);
