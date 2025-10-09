/*
  # Desactivar RLS para tablas de productos
  
  1. Cambios
    - Desactivar RLS en llaves, telemandos y carcasas
    - Esto hace que todos los productos sean públicos y visibles para todos
*/

-- Disable RLS on product tables
ALTER TABLE llaves DISABLE ROW LEVEL SECURITY;
ALTER TABLE telemandos DISABLE ROW LEVEL SECURITY;
ALTER TABLE carcasas DISABLE ROW LEVEL SECURITY;
