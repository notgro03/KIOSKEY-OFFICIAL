# Panel de Administración Kioskeys

## Resumen de Cambios Implementados

Se ha creado un sistema completo de gestión de contenido con las siguientes características:

### 1. Base de Datos en Supabase ✅

Tablas creadas con Row Level Security (RLS):

- **banner_gifs**: Gestiona los GIFs animados del banner principal
- **products**: Gestiona productos con iconos personalizables de Font Awesome
- **plans**: Gestiona planes y precios
- **admin_users**: Control de acceso de administradores

### 2. Panel de Administración ✅

**Ubicación**: `/pages/admin.html`

**Características**:
- Diseño moderno con tema oscuro y efectos glassmorphism
- Autenticación segura con Supabase Auth
- Interfaz intuitiva con pestañas organizadas
- Formularios dinámicos para agregar/editar contenido
- Gestión completa de:
  - GIFs del banner (agregar, editar, activar/desactivar, ordenar)
  - Productos con iconos Font Awesome personalizables
  - Planes con precios y características
- Botones de acción visual (editar, activar/desactivar, eliminar)

### 3. Tarjetas de Productos Mejoradas ✅

**Cambios en `/pages/productos.html`**:

- Diseño completamente rediseñado con gradientes azules sólidos
- Iconos grandes y destacados (96x96px) con efectos de brillo
- Tipografía mejorada con títulos más grandes (28px)
- Lista de características con checkmarks circulares
- Botones prominentes tipo píldora con efectos hover espectaculares
- Efectos de elevación y sombras volumétricas
- Animaciones suaves con transiciones elásticas
- Datos cargados dinámicamente desde Supabase
- Iconos personalizables vía panel de admin

### 4. Contenido Dinámico ✅

**Páginas actualizadas para cargar contenido desde Supabase**:

- **index.html**: Carga GIFs del banner y productos principales dinámicamente
- **productos.html**: Carga todos los productos con iconos y características

**Archivos creados**:
- `/src/index-dynamic.js`: Loader para página principal
- `/src/productos-dynamic.js`: Loader para página de productos
- `/src/admin.js`: Lógica completa del panel de administración

### 5. Sistema de Iconos ✅

Los productos ahora soportan iconos personalizables de Font Awesome:

- **Iconos disponibles**: Más de 1,600 iconos gratuitos
- **Ejemplos incluidos**:
  - `fa-car` (Telemandos)
  - `fa-key` (Llaves)
  - `fa-shield-alt` (Carcasas)
  - `fa-tools` (Accesorios)
- **Explorar más**: https://fontawesome.com/icons

## Cómo Empezar

### Paso 1: Crear Usuario Administrador

1. Ve a tu panel de Supabase > Authentication > Users
2. Haz clic en "Add user" y crea un usuario con email y contraseña
3. Ve a SQL Editor y ejecuta:

```sql
INSERT INTO admin_users (id, email)
SELECT id, email
FROM auth.users
WHERE email = 'tu-email@ejemplo.com';
```

### Paso 2: Acceder al Panel

1. Ve a `/pages/admin.html`
2. Inicia sesión con las credenciales del usuario creado
3. Comienza a gestionar tu contenido

### Paso 3: Agregar Contenido

#### Agregar un GIF al Banner:
1. Ve a la pestaña "GIFs del Banner"
2. Ingresa la URL del GIF (ej: de Giphy)
3. Agrega texto alternativo
4. Define el orden
5. Haz clic en "Guardar GIF"

#### Agregar un Producto:
1. Ve a la pestaña "Productos"
2. Completa el formulario:
   - **Título**: Nombre del producto
   - **Descripción**: Descripción breve
   - **Ícono**: Código Font Awesome (ej: fa-lock)
   - **Categoría**: telemandos, llaves, carcasas, etc.
   - **Características**: Lista de beneficios
   - **URL**: Enlace a la página del producto
   - **Texto del botón**: Ej: "Ver más"
   - **Orden**: Posición de visualización
3. Haz clic en "Guardar Producto"

#### Agregar un Plan:
1. Ve a la pestaña "Planes"
2. Completa:
   - **Nombre**: Nombre del plan
   - **Descripción**: Qué incluye
   - **Precio**: Valor numérico
   - **Moneda**: USD, EUR, etc.
   - **Características**: Lista de beneficios
   - **Plan Destacado**: Checkbox si es especial
   - **Orden**: Posición
3. Haz clic en "Guardar Plan"

## Características de Seguridad

- **Autenticación obligatoria**: Solo usuarios registrados pueden acceder
- **RLS (Row Level Security)**: Protección a nivel de base de datos
- **Permisos granulares**: Solo admins en `admin_users` pueden modificar
- **Lectura pública**: El contenido activo es visible para todos
- **Contenido inactivo**: Se puede desactivar sin eliminar

## Estructura de Archivos

```
/pages/
  admin.html              # Panel de administración
  productos.html          # Página de productos (actualizada)

/src/
  admin.js                # Lógica del panel de admin
  index-dynamic.js        # Loader para index.html
  productos-dynamic.js    # Loader para productos.html

/scripts/
  create-admin.sql        # Script SQL para crear admins

ADMIN_SETUP.md            # Guía detallada de configuración
PANEL_ADMIN_README.md     # Este archivo
```

## Próximos Pasos Sugeridos

1. **Crear tu primer usuario admin** siguiendo el Paso 1
2. **Personalizar los productos existentes** con nuevos iconos
3. **Agregar nuevos productos** según tu catálogo
4. **Configurar los planes** con tus precios
5. **Actualizar los GIFs del banner** con imágenes propias

## Soporte Técnico

Para más información:
- **Supabase Docs**: https://supabase.com/docs
- **Font Awesome Icons**: https://fontawesome.com/icons
- **Guía de configuración**: Ver `ADMIN_SETUP.md`

## Notas Importantes

- Los cambios son inmediatos y se reflejan en tiempo real
- El contenido inactivo no se muestra pero se conserva en la BD
- Los íconos deben usar el formato `fa-nombre-icono`
- Las características se guardan como JSON arrays
- Los precios se almacenan como números decimales

## Resumen Visual

### Antes
- Contenido estático en HTML
- Sin panel de administración
- Tarjetas básicas sin iconos destacados
- Sin gestión de contenido

### Después
- ✅ Contenido dinámico desde Supabase
- ✅ Panel de admin completo y moderno
- ✅ Tarjetas premium con iconos personalizables
- ✅ Gestión total de GIFs, productos y planes
- ✅ Sistema de autenticación seguro
- ✅ Interfaz profesional con efectos modernos

---

**Desarrollado para Kioskeys** | Powered by Supabase
