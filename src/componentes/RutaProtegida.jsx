// GUÍA: Controla el acceso a las rutas según la sesión y los roles permitidos.
// =============================================================
// RUTA PROTEGIDA DE HUERTOHOGAR
// Evita mostrar pantallas privadas a visitantes o roles no autorizados.
// La protección definitiva de cada operación también vive en Spring Security.
// =============================================================
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// GUÍA: Controla el acceso a las rutas según la sesión y los roles permitidos.
export default function RutaProtegida({ children, roles = [] }) {
  const { usuario, autenticado, cargandoSesion } = useAuth()
  const ubicacion = useLocation()

  if (cargandoSesion) return <p role="status">Verificando sesión...</p>
  if (!autenticado) return <Navigate to={`/login?redirigir=${encodeURIComponent(ubicacion.pathname)}`} replace />
  if (roles.length && !roles.includes(usuario?.rol)) return <Navigate to="/" replace />
  return children
}
