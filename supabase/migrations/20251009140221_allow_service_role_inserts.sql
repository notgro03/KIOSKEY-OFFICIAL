/*
  # Allow Service Role to Insert Products
  
  1. Changes
    - Add policies to allow service role to insert data into product tables
    - These policies allow the service role key to bypass RLS restrictions
*/

-- Allow service role to insert telemandos
CREATE POLICY "Service role can insert telemandos"
  ON telemandos
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow service role to delete telemandos
CREATE POLICY "Service role can delete telemandos"
  ON telemandos
  FOR DELETE
  TO service_role
  USING (true);

-- Allow service role to insert llaves
CREATE POLICY "Service role can insert llaves"
  ON llaves
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow service role to delete llaves
CREATE POLICY "Service role can delete llaves"
  ON llaves
  FOR DELETE
  TO service_role
  USING (true);

-- Allow service role to insert carcasas
CREATE POLICY "Service role can insert carcasas"
  ON carcasas
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow service role to delete carcasas
CREATE POLICY "Service role can delete carcasas"
  ON carcasas
  FOR DELETE
  TO service_role
  USING (true);
