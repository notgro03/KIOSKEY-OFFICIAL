-- Script para crear un usuario administrador
--
-- INSTRUCCIONES:
-- 1. Primero, crea un usuario en Supabase Auth (Panel > Authentication > Users)
-- 2. Luego ejecuta este script reemplazando el email con el email del usuario creado
-- 3. Ve a Supabase SQL Editor y ejecuta la query

-- Agregar usuario a la tabla de admins
-- IMPORTANTE: Reemplaza 'admin@kioskeys.com' con tu email real
INSERT INTO admin_users (id, email)
SELECT id, email
FROM auth.users
WHERE email = 'admin@kioskeys.com'
ON CONFLICT (id) DO NOTHING;

-- Verificar que el usuario fue agregado correctamente
SELECT * FROM admin_users;

-- Si necesitas ver todos los usuarios en auth
-- SELECT id, email, created_at FROM auth.users;
