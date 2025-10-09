/*
  # Otorgar permisos a rol anon
  
  1. Cambios
    - Otorgar permisos SELECT a rol anon en todas las tablas de productos
*/

-- Grant SELECT permissions to anon role
GRANT SELECT ON llaves TO anon;
GRANT SELECT ON telemandos TO anon;
GRANT SELECT ON carcasas TO anon;

-- Grant SELECT permissions to authenticated role too
GRANT SELECT ON llaves TO authenticated;
GRANT SELECT ON telemandos TO authenticated;
GRANT SELECT ON carcasas TO authenticated;
