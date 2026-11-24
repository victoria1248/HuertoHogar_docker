// GUÍA: Cliente HTTP compartido: construye peticiones al backend, adjunta el JWT y procesa errores.
// =============================================================
// HUERTOHOGAR - CLIENTE CENTRAL DE API REST
// El JWT de acceso se conserva solo en sessionStorage.
// Un 401 en una petición autenticada invalida la sesión local.
// Un 403 no cierra sesión: significa que el rol no tiene permiso.
// =============================================================

// GUÍA: Docker utiliza el mismo origen (cadena vacía); Vite local conserva el puerto 8080.
export function resolverBaseApi(url) {
  return (url ?? 'http://localhost:8080').replace(/\/+$/, '')
}
export const API_BASE_URL = resolverBaseApi(import.meta.env?.VITE_API_URL)
export const CLAVE_TOKEN = 'huertohogar_token'
const CLAVE_SESION = 'sesion_huerto'

// GUÍA: Borra las claves de sesión y emite un evento para actualizar la interfaz.
function notificarSesionExpirada() {
  sessionStorage.removeItem(CLAVE_TOKEN)
  sessionStorage.removeItem(CLAVE_SESION)
  try { localStorage.removeItem(CLAVE_SESION) } catch { /* almacenamiento legado no disponible */ }
  window.dispatchEvent(new Event('sesionExpirada'))
}

// GUÍA: Envía la petición HTTP, añade Bearer cuando corresponde y convierte la respuesta a datos.
export async function apiRequest(ruta, opciones = {}) {
  const { auth = true, headers = {}, ...config } = opciones
  const token = sessionStorage.getItem(CLAVE_TOKEN)
  const cabeceras = { 'Content-Type': 'application/json', ...headers }

  if (auth && token) cabeceras.Authorization = `Bearer ${token}`

  let respuesta
  try {
    respuesta = await fetch(`${API_BASE_URL}${ruta}`, {
      ...config,
      headers: cabeceras,
    })
  } catch {
    // Un fallo de red no significa que el JWT haya expirado.
    throw new Error('No se pudo conectar con el servidor. Comprueba que Spring Boot esté iniciado.')
  }

  const texto = await respuesta.text()
  let datos = null
  try { datos = texto ? JSON.parse(texto) : null }
  catch { datos = texto }

  if (!respuesta.ok) {
    // GUÍA: Una respuesta antigua no puede cerrar una nueva sesión abierta mientras esperaba.
    if (respuesta.status === 401 && auth && token && sessionStorage.getItem(CLAVE_TOKEN) === token) {
      notificarSesionExpirada()
    }
    const mensaje = datos?.message || datos?.error || datos?.mensaje || `Error HTTP ${respuesta.status}`
    throw new Error(mensaje)
  }
  return datos
}
