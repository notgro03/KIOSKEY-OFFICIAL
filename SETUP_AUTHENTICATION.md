# Configuración del Sistema de Autenticación WhatsApp

Este documento explica cómo configurar el sistema de autenticación con WhatsApp para Kioskeys.

## ✅ Lo que ya está implementado

1. **Base de datos completa** en Supabase con todas las tablas necesarias:
   - `users` - Usuarios del sistema
   - `otp_codes` - Códigos de verificación OTP
   - `cart` - Carrito de compras
   - `orders` - Pedidos
   - `cart_products` - Catálogo de productos
   - `user_addresses` - Direcciones de envío
   - `notification_preferences` - Preferencias de notificaciones
   - `notifications_log` - Registro de notificaciones enviadas

2. **Edge Functions de Supabase**:
   - `send-whatsapp-otp` - Envía códigos de verificación por WhatsApp
   - `verify-whatsapp-otp` - Verifica códigos y crea sesiones

3. **Sistema de carrito completo**:
   - Gestión de productos en carrito
   - Sincronización con base de datos
   - Persistencia local y en la nube
   - Cálculo automático de descuentos según plan

4. **Páginas creadas**:
   - `/pages/login.html` - Login con WhatsApp
   - `/pages/mi-cuenta.html` - Panel de usuario
   - `/pages/carrito.html` - Carrito de compras
   - Iconos de carrito y usuario en navegación global

## 🔧 Configuración de Twilio WhatsApp API

Para que el sistema de autenticación funcione en producción, necesitas configurar Twilio:

### Paso 1: Crear cuenta en Twilio

1. Regístrate en [Twilio](https://www.twilio.com/try-twilio)
2. Verifica tu cuenta y número de teléfono

### Paso 2: Configurar WhatsApp Business API

1. Ve a [Twilio Console](https://console.twilio.com/)
2. En el menú lateral, busca "Messaging" → "Try it out" → "Send a WhatsApp message"
3. Sigue el wizard para configurar tu número de WhatsApp Business
4. Twilio te proporcionará un número con formato: `whatsapp:+1234567890`

### Paso 3: Obtener credenciales

En tu Dashboard de Twilio, encontrarás:
- **Account SID**: Tu identificador de cuenta (comienza con `AC...`)
- **Auth Token**: Tu token de autenticación (haz clic en "Show" para verlo)
- **WhatsApp Number**: El número de WhatsApp que configuraste

### Paso 4: Configurar variables de entorno en Supabase

**IMPORTANTE**: Las Edge Functions ya están desplegadas. Solo necesitas configurar las siguientes variables de entorno en tu proyecto de Supabase:

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a "Settings" → "Edge Functions" → "Secrets"
3. Agrega estas tres variables:

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=+1234567890
```

**Nota**: El número de WhatsApp debe estar en formato E.164 (con + y código de país).

### Paso 5: Verificar configuración

Una vez configuradas las variables:

1. Los usuarios podrán registrarse e iniciar sesión en `/pages/login.html`
2. Recibirán códigos de 6 dígitos por WhatsApp
3. Los códigos expiran en 5 minutos
4. Límite de 3 códigos por hora por número de teléfono

## 🧪 Modo de desarrollo

**El sistema funciona sin Twilio en modo desarrollo**:
- Los códigos OTP se generan pero se devuelven en la respuesta de la API
- Puedes ver el código en la consola del navegador
- Útil para pruebas locales

## 📱 Flujo de autenticación

1. Usuario ingresa su número de WhatsApp en `/pages/login.html`
2. Sistema genera código de 6 dígitos y lo envía por WhatsApp vía Twilio
3. Usuario ingresa el código recibido
4. Sistema verifica el código y crea sesión
5. Usuario es redirigido a `/pages/mi-cuenta.html`

## 🛒 Sistema de Carrito

El carrito de compras ya está integrado:
- Se muestra el ícono con badge en la navegación
- Funciona sin autenticación (localStorage)
- Se sincroniza con la base de datos al iniciar sesión
- Página de carrito en `/pages/carrito.html`

## 🔐 Seguridad

- Rate limiting: máximo 3 códigos por hora
- Códigos OTP de 6 dígitos
- Expiración de 5 minutos
- Máximo 3 intentos de verificación
- RLS habilitado en todas las tablas
- Usuarios solo ven sus propios datos

## 📊 Base de datos

Todas las migraciones ya están aplicadas. Puedes ver las tablas en:
- Supabase Dashboard → Table Editor

## 🎨 Integración con el sitio

- El carrito y autenticación están integrados en `main.js`
- Los estilos están en `style.css`
- Funciona con el tema oscuro existente

## ⚠️ Importante

- En producción, configura las 3 variables de entorno de Twilio
- Sin Twilio, el sistema funcionará en modo desarrollo
- Los códigos OTP se registran en `notifications_log` para auditoría
- La tabla `otp_codes` se limpia automáticamente de códigos expirados

## 🚀 Próximos pasos sugeridos

Para completar el e-commerce, necesitas implementar:

1. **Página de checkout** (`/pages/checkout.html`)
2. **Integración con MercadoPago** para procesar pagos
3. **Botones "Agregar al Carrito"** en páginas de productos
4. **Panel admin extendido** con gestión de pedidos y usuarios
5. **Edge Functions** para notificaciones de pedidos
6. **Sincronización** con app móvil existente

## 📞 Soporte

Para más información sobre Twilio WhatsApp API:
- [Documentación oficial](https://www.twilio.com/docs/whatsapp)
- [Precios de Twilio WhatsApp](https://www.twilio.com/whatsapp/pricing)
