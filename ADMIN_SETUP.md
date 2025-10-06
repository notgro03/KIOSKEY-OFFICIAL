# Panel de Administración - Configuración

## Acceso al Panel
El panel de administración está disponible en: `/pages/admin.html`

## Crear Usuario Administrador

Para crear un usuario administrador, sigue estos pasos:

### 1. Crear usuario en Supabase Auth
Primero, crea un usuario en Supabase Auth:

```sql
-- Ve a tu panel de Supabase > Authentication > Users
-- Haz clic en "Add user" y crea un nuevo usuario con email y contraseña
-- O usa la API de Supabase para crear el usuario
```

### 2. Agregar usuario a la tabla admin_users
Una vez creado el usuario, ejecuta este SQL en Supabase para darle permisos de admin:

```sql
-- Reemplaza 'tu-email@ejemplo.com' con el email del usuario que creaste
INSERT INTO admin_users (id, email)
SELECT id, email
FROM auth.users
WHERE email = 'tu-email@ejemplo.com';
```

### 3. Iniciar Sesión
Ahora puedes acceder al panel de administración en `/pages/admin.html` con las credenciales del usuario que creaste.

## Funcionalidades del Panel

### 1. Gestión de GIFs del Banner
- **Agregar nuevos GIFs**: Proporciona la URL del GIF, texto alternativo y orden
- **Activar/Desactivar**: Control de visibilidad de cada GIF
- **Eliminar**: Borrar GIFs que ya no necesitas
- **Ordenar**: Define el orden de visualización

### 2. Gestión de Productos
- **Crear/Editar productos**: Título, descripción, ícono (Font Awesome), categoría
- **Características**: Lista dinámica de características del producto
- **Enlaces**: URL y texto del botón personalizado
- **Iconos**: Usa cualquier ícono de Font Awesome (ej: fa-car, fa-key, fa-shield-alt, fa-tools)
- **Buscar íconos en**: https://fontawesome.com/icons

### 3. Gestión de Planes
- **Crear/Editar planes**: Nombre, descripción, precio y moneda
- **Características**: Lista de beneficios del plan
- **Plan Destacado**: Marca planes especiales
- **Ordenar**: Controla el orden de visualización

## Estructura de la Base de Datos

### Tabla: banner_gifs
```
- id (uuid)
- url (text) - URL del GIF
- alt_text (text) - Texto alternativo
- order_position (integer) - Orden de visualización
- active (boolean) - Si está activo
- created_at (timestamp)
- updated_at (timestamp)
```

### Tabla: products
```
- id (uuid)
- title (text) - Título del producto
- description (text) - Descripción
- icon (text) - Código del ícono Font Awesome
- category (text) - Categoría (telemandos, llaves, etc.)
- features (jsonb) - Array de características
- link_url (text) - URL del enlace
- link_text (text) - Texto del botón
- order_position (integer)
- active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

### Tabla: plans
```
- id (uuid)
- name (text) - Nombre del plan
- description (text) - Descripción
- price (numeric) - Precio
- currency (text) - Moneda (USD, EUR, etc.)
- features (jsonb) - Array de características
- highlight (boolean) - Si está destacado
- order_position (integer)
- active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

### Tabla: admin_users
```
- id (uuid) - Referencias auth.users(id)
- email (text) - Email del admin
- created_at (timestamp)
```

## Seguridad

- **RLS (Row Level Security)**: Todas las tablas tienen RLS habilitado
- **Políticas de Lectura**: Cualquiera puede ver contenido activo
- **Políticas de Escritura**: Solo usuarios en `admin_users` pueden modificar contenido
- **Autenticación**: Sistema de login con Supabase Auth

## Páginas Dinámicas

Las siguientes páginas cargan contenido dinámicamente desde Supabase:

1. **index.html**: Carga GIFs del banner y productos de la página principal
2. **productos.html**: Carga todos los productos con iconos y características

Los cambios realizados en el panel de administración se reflejan automáticamente en estas páginas.

## Iconos Disponibles

Los productos usan Font Awesome Icons. Algunos ejemplos populares:

- `fa-car` - Auto
- `fa-key` - Llave
- `fa-shield-alt` - Escudo
- `fa-tools` - Herramientas
- `fa-lock` - Candado
- `fa-home` - Casa
- `fa-building` - Edificio
- `fa-user` - Usuario
- `fa-box` - Caja
- `fa-wrench` - Llave inglesa
- `fa-cog` - Engranaje
- `fa-mobile-alt` - Móvil
- `fa-laptop` - Laptop

Busca más en: https://fontawesome.com/icons

## Ejemplo de Uso

### Agregar un nuevo producto:
1. Ve a la pestaña "Productos"
2. Completa el formulario:
   - Título: "Cerraduras Inteligentes"
   - Descripción: "Cerraduras electrónicas de última generación"
   - Ícono: fa-lock
   - Categoría: cerraduras
   - Agrega características una por una
   - URL: /pages/cerraduras.html
   - Texto del botón: "Ver cerraduras"
   - Orden: 5
3. Haz clic en "Guardar Producto"
4. El producto aparecerá automáticamente en la página de productos

## Soporte

Para más ayuda o problemas, consulta la documentación de Supabase:
- https://supabase.com/docs
- https://supabase.com/docs/guides/auth
- https://supabase.com/docs/guides/database/postgres/row-level-security
