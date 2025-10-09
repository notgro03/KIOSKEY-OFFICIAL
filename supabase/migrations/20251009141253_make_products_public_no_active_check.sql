/*
  # Hacer productos públicos sin verificar active
  
  1. Cambios
    - Eliminar políticas que requieren active = true
    - Crear políticas públicas simples que permitan ver todos los registros
*/

-- Drop policies that check active
DROP POLICY IF EXISTS "Public read llaves" ON llaves;
DROP POLICY IF EXISTS "Public read telemandos" ON telemandos;
DROP POLICY IF EXISTS "Public read carcasas" ON carcasas;

-- Create simple public policies without active check
CREATE POLICY "Anyone can view llaves"
  ON llaves FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view telemandos"
  ON telemandos FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view carcasas"
  ON carcasas FOR SELECT
  TO anon, authenticated
  USING (true);
