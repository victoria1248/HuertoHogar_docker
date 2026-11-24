// GUÍA: Centraliza el usuario, el estado de autenticación y las operaciones de sesión para todos los componentes React.
// =============================================================
// HUERTOHOGAR - CONTEXTO DE AUTENTICACIÓN INTEGRADO
// Spring Boot firma y valida el JWT. React conserva el token
// solo en sessionStorage y vuelve a consultar /api/v1/auth/me al recargar.
// El access token dura 30 minutos por defecto. No hay refresh token:
// al expirar, se elimina la sesión y se solicita iniciar sesión otra vez.
// =============================================================
import { createContext, useContext, useEffect, useState } from 'react'
import { apiRequest, CLAVE_TOKEN } from '../servicios/api.js'

const AuthContext = createContext(null)
const CLAVE_SESION = 'sesion_huerto'

// GUÍA: Unifica los nombres de roles recibidos del servidor para las comparaciones del frontend.
function normalizarRol(rol) {
  const valor = String(rol || '').trim().replace(/^ROLE_/, '').toLowerCase()
  if (valor === 'admin' || valor === 'administrador') return 'admin'
  if (valor === 'vendedor') return 'vendedor'
  if (valor === 'cliente') return 'cliente'
  return null
}

// GUÍA: Recupera el perfil de esta pestaña solo si existe un token; no sustituye la validación del backend.
function leerPerfilTemporal() {
  if (!sessionStorage.getItem(CLAVE_TOKEN)) return null
  try {
    const perfil = JSON.parse(sessionStorage.getItem(CLAVE_SESION) || 'null')
    const rol = normalizarRol(perfil?.rol)
    return perfil?.correo && rol ? { ...perfil, rol } : null
  } catch { return null }
}

// GUÍA: Lee el campo exp del JWT para programar el cierre local; no verifica su firma.
function obtenerExpiracionToken(token) {
  try {
    const segmento = token.split('.')[1]
    const base64 = segmento.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64))
    return Number(payload.exp) * 1000
  } catch {
    return null
  }
}

// GUÍA: Elimina token y perfil de sessionStorage y limpia el perfil legado.
function limpiarSesionLocal() {
  sessionStorage.removeItem(CLAVE_TOKEN)
  sessionStorage.removeItem(CLAVE_SESION)
  // Limpia el perfil legado de versiones anteriores; nunca se usa como autenticación.
  try { localStorage.removeItem(CLAVE_SESION) } catch { /* almacenamiento legado no disponible */ }
}

// GUÍA: Comparte el estado de sesión con los componentes hijos y coordina su validación.
export function AuthProvider({ children }) {
  // GUÍA: Estado de React: conserva los valores de esta sección y vuelve a renderizar al actualizarlos.
  const [usuario, setUsuario] = useState(leerPerfilTemporal)
  const [cargandoSesion, setCargandoSesion] = useState(Boolean(sessionStorage.getItem(CLAVE_TOKEN)))

  // Al recargar, el backend vuelve a validar firma, expiración y revocación.
  // GUÍA: Efecto de React: ejecuta la sincronización o suscripción de este bloque según sus dependencias; revisar la limpieza al desmontar.
  useEffect(() => {
    let activo = true
    const token = sessionStorage.getItem(CLAVE_TOKEN)
    if (!token) {
      setCargandoSesion(false)
      return () => { activo = false }
    }

    apiRequest('/api/v1/auth/me')
      .then(perfil => {
        if (!activo) return
        const rol = normalizarRol(perfil.rol)
        if (!rol) throw new Error('La cuenta tiene un rol no autorizado.')
        const seguro = { nombre: perfil.nombre, correo: perfil.correo, rol }
        sessionStorage.setItem(CLAVE_SESION, JSON.stringify(seguro))
        setUsuario(seguro)
      })
      .catch(() => {
        limpiarSesionLocal()
        if (activo) setUsuario(null)
      })
      .finally(() => { if (activo) setCargandoSesion(false) })

    return () => { activo = false }
  }, [])

  // Si el backend devuelve 401, cerrar la sesión visual y volver a la tienda.
  // GUÍA: Efecto de React: ejecuta la sincronización o suscripción de este bloque según sus dependencias; revisar la limpieza al desmontar.
  useEffect(() => {
    const manejarSesionExpirada = () => {
      limpiarSesionLocal()
      setUsuario(null)
      const rutaActual = window.location.pathname
      const destino = ['/login', '/registro'].includes(rutaActual) ? '/productos' : rutaActual
      window.location.assign(`/login?redirigir=${encodeURIComponent(destino)}`)
    }
    window.addEventListener('sesionExpirada', manejarSesionExpirada)
    return () => window.removeEventListener('sesionExpirada', manejarSesionExpirada)
  }, [])

  // Aviso local al llegar a exp: el servidor sigue siendo la autoridad final.
  // GUÍA: Efecto de React: ejecuta la sincronización o suscripción de este bloque según sus dependencias; revisar la limpieza al desmontar.
  useEffect(() => {
    const token = sessionStorage.getItem(CLAVE_TOKEN)
    if (!token || !usuario) return undefined

    const expiraEn = obtenerExpiracionToken(token)
    if (!expiraEn) return undefined
    const restante = expiraEn - Date.now()
    if (restante <= 0) {
      window.dispatchEvent(new Event('sesionExpirada'))
      return undefined
    }

    const temporizador = window.setTimeout(
      () => window.dispatchEvent(new Event('sesionExpirada')),
      Math.min(restante, 2147483647)
    )
    return () => window.clearTimeout(temporizador)
  }, [usuario?.correo])

  // Login real: el servidor compara BCrypt y entrega un JWT de acceso.
  // GUÍA: Solicita o realiza la autenticación de credenciales; el JWT identifica la sesión posterior.
  async function iniciarSesion(credenciales) {
    try {
      const respuesta = await apiRequest('/api/v1/auth/login', {
        method: 'POST', auth: false,
        body: JSON.stringify({ correo: credenciales.correo, password: credenciales.password }),
      })
      if (!respuesta?.token || !respuesta?.correo) throw new Error('El backend no devolvió una sesión válida.')
      const rol = normalizarRol(respuesta.rol)
      if (!rol) throw new Error('La cuenta tiene un rol no autorizado.')
      const perfil = { nombre: respuesta.nombre || 'Usuario', correo: respuesta.correo, rol }
      sessionStorage.setItem(CLAVE_TOKEN, respuesta.token)
      sessionStorage.setItem(CLAVE_SESION, JSON.stringify(perfil))
      setUsuario(perfil)
      window.dispatchEvent(new Event('sesionActualizada'))
      return { ok: true, usuario: perfil }
    } catch (error) {
      limpiarSesionLocal()
      setUsuario(null)
      return { ok: false, error: error.message || 'No fue posible iniciar sesión.' }
    }
  }

  // Primero revoca el JWT en MySQL; luego elimina los datos de esta pestaña.
  // Si no hay conexión, igualmente se cierra la sesión local.
  // GUÍA: Finaliza la sesión según esta capa; consultar la revocación del token y la limpieza local.
  async function cerrarSesion() {
    const token = sessionStorage.getItem(CLAVE_TOKEN)
    try {
      if (token) await apiRequest('/api/v1/auth/logout', { method: 'POST' })
    } catch {
      console.warn('No se pudo confirmar la revocación remota; la sesión local se cerrará igualmente.')
    } finally {
      limpiarSesionLocal()
      setUsuario(null)
      window.dispatchEvent(new Event('sesionActualizada'))
      window.location.assign('/')
    }
  }

  const valor = {
    usuario, cargandoSesion,
    autenticado: Boolean(usuario && sessionStorage.getItem(CLAVE_TOKEN)),
    esAdministrador: usuario?.rol === 'admin',
    esVendedor: usuario?.rol === 'vendedor',
    esCliente: usuario?.rol === 'cliente',
    iniciarSesion, cerrarSesion,
  }
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

// GUÍA: Permite consumir el contexto de autenticación desde otros componentes.
export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe utilizarse dentro de AuthProvider')
  return contexto
}

export default AuthContext
