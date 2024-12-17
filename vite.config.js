import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'como-funciona': resolve(__dirname, 'pages/como-funciona.html'),
        'red-servicios': resolve(__dirname, 'pages/red-servicios.html'),
        'planes': resolve(__dirname, 'pages/planes.html'),
        'productos': resolve(__dirname, 'pages/productos.html'),
        'contacto': resolve(__dirname, 'pages/contacto.html'),
        'tutoriales': resolve(__dirname, 'pages/tutoriales.html'),
        'telemandos': resolve(__dirname, 'pages/telemandos.html'),
        'blog': resolve(__dirname, 'pages/blog.html'),
        'faq': resolve(__dirname, 'pages/faq.html'),
        'privacidad': resolve(__dirname, 'pages/privacidad.html'),
        'terminos': resolve(__dirname, 'pages/terminos.html'),
        'llaves': resolve(__dirname, 'pages/llaves.html'),
        'carcasas': resolve(__dirname, 'pages/carcasas.html'),
        'accesorios': resolve(__dirname, 'pages/accesorios.html'),
        'admin': resolve(__dirname, 'pages/admin/kioskeys-admin-x7k9y2.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@admin': resolve(__dirname, 'src/admin')
    }
  },
  server: {
    open: true
  }
})