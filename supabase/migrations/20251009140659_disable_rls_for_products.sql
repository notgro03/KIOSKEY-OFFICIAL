/*
  # Disable RLS for Product Tables
  
  1. Changes
    - Temporarily disable RLS on product tables to allow public access
    - This makes all products visible to everyone without restrictions
*/

-- Disable RLS on all product tables
ALTER TABLE telemandos DISABLE ROW LEVEL SECURITY;
ALTER TABLE llaves DISABLE ROW LEVEL SECURITY;
ALTER TABLE carcasas DISABLE ROW LEVEL SECURITY;
