// GUÍA: Genera claves locales independientes por correo o invitado.
// Carritos independientes por correo; los visitantes usan un carrito temporal.
// GUÍA: Punto de entrada de la operación claveCarritoActual; aquí se concentra su comportamiento.
export function claveCarritoActual() {
  let sesion = null
  try { sesion = JSON.parse(sessionStorage.getItem('sesion_huerto') || 'null') } catch {}
  const correo = sesion?.correo?.trim().toLowerCase()
  return correo ? `carrito_huerto_usuario_${encodeURIComponent(correo)}` : 'carrito_huerto_invitado'
}
// GUÍA: Lee carrito actual según los datos recibidos.
export function leerCarritoActual() {
  try {
    const datos = JSON.parse(localStorage.getItem(claveCarritoActual()) || '[]')
    return Array.isArray(datos) ? datos : []
  } catch { return [] }
}
// GUÍA: Guarda carrito actual según los datos recibidos.
export function guardarCarritoActual(productos) {
  localStorage.setItem(claveCarritoActual(), JSON.stringify(productos))
  window.dispatchEvent(new Event('carritoActualizado'))
}
// GUÍA: Limpia carrito actual según los datos recibidos.
export function limpiarCarritoActual() {
  localStorage.removeItem(claveCarritoActual())
  window.dispatchEvent(new Event('carritoActualizado'))
}
