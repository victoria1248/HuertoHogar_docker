// GUÍA: Organiza la aplicación y sus componentes o rutas según el módulo.
import { lazy, Suspense } from 'react'
import { useAuth } from './context/AuthContext.jsx'
import { seccion } from './rutas/navegacion.js'

const modulos = {
  tienda: lazy(() => import('./modulos/Tienda.jsx')),
  blog: lazy(() => import('./modulos/Blog.jsx')),
  informacion: lazy(() => import('./modulos/Informacion.jsx')),
}
const Seccion = modulos[seccion]

// GUÍA: Organiza la aplicación y sus componentes o rutas según el módulo.
export default function App() {
  const { cargandoSesion } = useAuth()
  if (cargandoSesion) return <p role="status">Verificando sesión...</p>

  // Las secciones públicas (Blog e Información) están disponibles para
  // visitantes, clientes y administradores. Las acciones privadas siguen
  // protegidas por RutaProtegida y por las reglas de Spring Security.
  return <Suspense fallback={<p role="status">Cargando HuertoHogar…</p>}><Seccion /></Suspense>
}
