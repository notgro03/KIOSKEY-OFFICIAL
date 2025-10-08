# Configuración de Facebook y Google Login en Supabase

## Los botones de Facebook y Google YA ESTÁN en la página de login

Los botones de inicio de sesión con Facebook y Google ya están implementados en:
- **Página:** `/pages/login.html`
- **Ubicación:** En la parte superior del formulario de login, antes del login con teléfono

## Configuración requerida en Supabase Dashboard

Para que los botones funcionen, necesitas configurar las credenciales en Supabase:

### 1. Accede al Dashboard de Supabase
- URL: https://supabase.com/dashboard
- Ve a tu proyecto: **notgro03**

### 2. Configurar Facebook Login

#### Paso 1: Habilitar Facebook Provider
1. Ve a **Authentication** → **Providers** en el menú lateral
2. Busca **Facebook** en la lista de proveedores
3. Haz clic para expandir la configuración

#### Paso 2: Ingresar credenciales de Facebook
```
Facebook App ID: 4381922235373241
Facebook App Secret: cf9b8c0da2223f5383b0f2de6aaa537c
```

#### Paso 3: Configurar URLs de Callback en Facebook
1. Ve a https://developers.facebook.com/apps/
2. Selecciona tu app (ID: 4381922235373241)
3. Ve a **Facebook Login** → **Settings**
4. En **Valid OAuth Redirect URIs**, agrega:
```
https://0ec90b57d6e95fcbda19832f.supabase.co/auth/v1/callback
https://kioskeys.com/auth/callback
http://localhost:5173/auth/callback
```

#### Paso 4: Configurar User Data Deletion
1. En tu app de Facebook, ve a **Settings** → **Basic**
2. En **User Data Deletion**, agrega:
```
https://kioskeys.com/pages/eliminacion-datos.html
```

### 3. Configurar Google Login

#### Paso 1: Habilitar Google Provider
1. Ve a **Authentication** → **Providers** en Supabase
2. Busca **Google** en la lista
3. Haz clic para expandir la configuración

#### Paso 2: Crear credenciales en Google Cloud Console
1. Ve a https://console.cloud.google.com/
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services** → **Credentials**
4. Haz clic en **Create Credentials** → **OAuth 2.0 Client ID**
5. Tipo de aplicación: **Web application**
6. En **Authorized redirect URIs**, agrega:
```
https://0ec90b57d6e95fcbda19832f.supabase.co/auth/v1/callback
```

#### Paso 3: Ingresar credenciales en Supabase
Copia el **Client ID** y **Client Secret** de Google Cloud Console y pégalos en Supabase.

### 4. Verificar la configuración

#### Probar Facebook Login
1. Ve a https://kioskeys.com/pages/login.html
2. Haz clic en el botón "Continuar con Facebook"
3. Deberías ver la pantalla de autorización de Facebook
4. Después de autorizar, serás redirigido a /pages/mi-cuenta.html

#### Probar Google Login
1. Ve a https://kioskeys.com/pages/login.html
2. Haz clic en el botón "Continuar con Google"
3. Deberías ver la pantalla de selección de cuenta de Google
4. Después de seleccionar una cuenta, serás redirigido a /pages/mi-cuenta.html

## Ubicación de los botones en el código

Los botones están implementados en `/pages/login.html`:

```html
<!-- Botón de Google (línea ~376) -->
<button type="button" class="btn btn-social btn-google" id="googleLoginBtn">
  <svg>...</svg>
  <span>Continuar con Google</span>
</button>

<!-- Botón de Facebook (línea ~386) -->
<button type="button" class="btn btn-social btn-facebook" id="facebookLoginBtn">
  <i class="fab fa-facebook-f"></i>
  <span>Continuar con Facebook</span>
</button>
```

La lógica de autenticación está en `/src/auth-login.js`:
- Función `googleLoginBtn` (línea 34-58)
- Función `facebookLoginBtn` (línea 60-80)

## Solución de problemas

### Los botones no aparecen
- Verifica que estés en la página correcta: `/pages/login.html`
- Los botones están ANTES del formulario de teléfono
- Limpia la caché del navegador (Ctrl + Shift + R)

### Error al hacer clic en los botones
- Verifica que las credenciales estén configuradas en Supabase
- Verifica que los providers estén habilitados en Supabase
- Revisa la consola del navegador (F12) para ver errores específicos

### Callback URL inválida
- Asegúrate de haber agregado la URL de callback en Facebook/Google
- La URL debe ser exactamente: `https://0ec90b57d6e95fcbda19832f.supabase.co/auth/v1/callback`

## Notas importantes

1. **Los botones YA ESTÁN implementados** - Solo necesitas configurar las credenciales en Supabase
2. **Facebook requiere HTTPS** - No funcionará en localhost sin configuración adicional
3. **La página de eliminación de datos** está lista en `/pages/eliminacion-datos.html`
4. **Todas las rutas de callback** ya están configuradas en el código

## Verificación rápida

Para verificar que todo está listo:
1. Abre `/pages/login.html` en tu navegador
2. Deberías ver:
   - Botón blanco de Google en la parte superior
   - Botón azul de Facebook debajo de Google
   - Una línea divisoria con "O continúa con teléfono"
   - El formulario de teléfono/WhatsApp debajo
