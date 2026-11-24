// GUÍA: Vite conserva las rutas de imágenes antiguas durante desarrollo y preview.
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import rutas from './imagenes-optimizadas.json'
function imagenesLegadas() {
  const middleware = (req, res, next) => {
    try {
      const url = new URL(req.url, 'http://localhost')
      const anterior = decodeURIComponent(url.pathname)
      if (Object.hasOwn(rutas, anterior)) req.url = encodeURI(rutas[anterior]) + url.search
    } catch { /* Una URL inválida sigue al manejador normal de Vite. */ }
    next()
  }
  return { name: 'huertohogar-imagenes-legadas',
    configureServer(server) { server.middlewares.use(middleware) },
    configurePreviewServer(server) { server.middlewares.use(middleware) } }
}
export default defineConfig({ plugins: [react(), imagenesLegadas()] })
