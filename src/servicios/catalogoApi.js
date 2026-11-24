// GUÍA: Comparte solo peticiones públicas simultáneas. No guarda stock ni precios en caché.
import { apiRequest } from './api.js'
let pendiente = null
export function consultarCatalogo({ actualizar = false } = {}) {
  if (pendiente && !actualizar) return pendiente
  const solicitud = apiRequest('/api/v1/productos', { auth: false })
  pendiente = solicitud
  const limpiar = () => { if (pendiente === solicitud) pendiente = null }
  solicitud.then(limpiar, limpiar)
  return solicitud
}
