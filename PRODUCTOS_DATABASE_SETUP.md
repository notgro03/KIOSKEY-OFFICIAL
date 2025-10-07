# Configuración de Base de Datos de Productos

## ✅ Tablas Creadas

He creado las siguientes tablas en Supabase para que las páginas de productos funcionen correctamente:

### 1. Tabla `llaves`
Catálogo de llaves de auto con:
- `brand` - Marca del auto (Toyota, Ford, Chevrolet, etc.)
- `model` - Modelo del auto
- `description` - Descripción de la llave
- `image_url` - URL de la imagen
- `price` - Precio
- `stock` - Stock disponible
- `active` - Si está disponible para venta

### 2. Tabla `telemandos`
Catálogo de controles remotos con:
- `brand` - Marca del telemando
- `model` - Modelo compatible
- `description` - Descripción
- `image_url` - URL de la imagen
- `price` - Precio
- `stock` - Stock disponible
- `active` - Si está disponible

### 3. Tabla `carcasas`
Catálogo de carcasas para llaves con:
- `brand` - Marca compatible
- `model` - Modelo compatible
- `description` - Descripción
- `image_url` - URL de la imagen
- `price` - Precio
- `stock` - Stock disponible
- `color` - Color de la carcasa
- `active` - Si está disponible

## 📊 Datos de Ejemplo

Cada tabla tiene 5 productos de ejemplo insertados:

### Llaves:
1. Toyota Corolla 2020-2023 - $15,000
2. Ford Focus 2018-2022 - $18,000
3. Chevrolet Onix 2019-2023 - $12,000
4. Volkswagen Gol 2017-2022 - $14,000
5. Renault Sandero 2020-2023 - $16,000

### Telemandos:
1. Toyota Universal - $8,000
2. Ford Ranger 2015-2020 - $9,500
3. Chevrolet S10 2018-2023 - $8,500
4. Volkswagen Amarok 2016-2022 - $10,000
5. Fiat Toro 2019-2023 - $7,500

### Carcasas:
1. Toyota Universal - $3,000 (Negro)
2. Ford Focus/Fiesta - $3,500 (Negro)
3. Chevrolet Onix/Cruze - $4,000 (Gris)
4. Volkswagen Gol/Voyage - $3,200 (Negro)
5. Renault Sandero/Logan - $2,500 (Azul)

## 🔐 Seguridad (RLS)

Todas las tablas tienen Row Level Security habilitado con las siguientes políticas:

### Lectura Pública:
- Cualquier persona puede ver productos activos (active = true)
- No requiere autenticación

### Administración:
- Solo usuarios con rol 'admin' pueden:
  - Crear nuevos productos
  - Editar productos existentes
  - Eliminar productos
  - Cambiar estado activo/inactivo

## 🎯 Cómo Funcionan las Páginas

### `/pages/llaves.html`
1. Carga todas las marcas disponibles desde la tabla `llaves`
2. Al seleccionar una marca, muestra los modelos disponibles
3. Al seleccionar marca y modelo, muestra las llaves con:
   - Imagen del producto
   - Descripción
   - Precio
   - Stock disponible
   - Botón de WhatsApp para consultar

### `/pages/telemandos.html`
- Funcionalidad similar a llaves
- Muestra telemandos por marca y modelo

### `/pages/carcasas.html`
- Funcionalidad similar a llaves
- Incluye información de color
- Muestra carcasas compatibles

## 📝 Agregar Nuevos Productos

### Desde el Panel Admin (Recomendado)

Una vez implementes la gestión de productos en `/pages/admin.html`, podrás:
1. Agregar productos con formulario
2. Subir imágenes
3. Gestionar stock
4. Activar/desactivar productos

### Directamente en Supabase

Puedes agregar productos manualmente en Supabase Dashboard:

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a "Table Editor"
3. Selecciona la tabla (llaves, telemandos o carcasas)
4. Haz clic en "Insert" → "Insert row"
5. Completa los campos:
   - brand: Nombre de la marca
   - model: Modelo del vehículo
   - description: Descripción del producto
   - image_url: URL de la imagen (usa Unsplash, Cloudinary, etc.)
   - price: Precio en número
   - stock: Cantidad disponible
   - active: true

### Con SQL

También puedes insertar productos con SQL:

```sql
INSERT INTO llaves (brand, model, description, image_url, price, stock)
VALUES (
  'Honda',
  'Civic 2020-2023',
  'Llave inteligente con botones',
  'https://tu-url-de-imagen.com/imagen.jpg',
  17000,
  10
);
```

## 🔍 Verificar Datos

Para verificar que los productos se están mostrando:

1. Ve a tu proyecto en desarrollo
2. Navega a `/pages/llaves.html`
3. Selecciona una marca del dropdown
4. Deberías ver los modelos disponibles
5. Selecciona un modelo y haz clic en "Buscar"
6. Los productos se mostrarán con su información

## 🐛 Solución de Problemas

### No se muestran productos

1. **Verifica la conexión a Supabase**:
   - Revisa que el archivo `.env` tenga las credenciales correctas
   - Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén configurados

2. **Verifica que hay datos en las tablas**:
   ```sql
   SELECT COUNT(*) FROM llaves;
   SELECT COUNT(*) FROM telemandos;
   SELECT COUNT(*) FROM carcasas;
   ```

3. **Verifica las políticas RLS**:
   - En Supabase Dashboard, ve a la tabla
   - Verifica que la política "Anyone can view active products" esté habilitada

4. **Revisa la consola del navegador**:
   - Abre DevTools (F12)
   - Mira la consola por errores de red o JavaScript

### Productos no se filtran correctamente

- Verifica que los nombres de marca y modelo sean consistentes
- Revisa que el campo `active` esté en `true`

## 📸 URLs de Imágenes

Los productos de ejemplo usan imágenes de Unsplash. Para producción, te recomiendo:

1. **Cloudinary** - CDN gratuito con transformaciones de imagen
2. **Supabase Storage** - Almacenamiento incluido en tu proyecto
3. **ImgBB** - Hosting de imágenes gratuito
4. **Tu propio servidor** - Mayor control

### Subir a Supabase Storage:

```javascript
const { data, error } = await supabase.storage
  .from('productos')
  .upload('llaves/toyota-corolla.jpg', file);

// Obtener URL pública
const { data: { publicUrl } } = supabase.storage
  .from('productos')
  .getPublicUrl('llaves/toyota-corolla.jpg');
```

## 🚀 Próximos Pasos

1. **Agregar botón "Agregar al Carrito"** en los resultados de búsqueda
2. **Implementar gestión de productos** en el panel admin
3. **Agregar filtros adicionales**: precio, año, disponibilidad
4. **Implementar búsqueda por texto**
5. **Agregar más campos**: garantía, especificaciones técnicas, etc.

## 📊 Estadísticas Actuales

- **Total de llaves**: 5 productos
- **Total de telemandos**: 5 productos
- **Total de carcasas**: 5 productos
- **Total de productos**: 15 productos

---

**¡Todo está configurado y funcionando!** Las páginas de llaves, telemandos y carcasas ahora cargan datos desde Supabase correctamente.
