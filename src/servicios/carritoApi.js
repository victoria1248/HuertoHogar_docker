import { consultarCatalogo } from './catalogoApi.js'
// GUÍA: Conecta el carrito persistente del usuario con Spring Boot y conserva un carrito local para invitados.
// =============================================================
// HUERTOHOGAR - SERVICIO DE CARRITO
// Los usuarios autenticados utilizan Spring Boot/MySQL como fuente
// de verdad. Los visitantes conservan un carrito temporal local,
// que se sincroniza al iniciar sesión.
// =============================================================
import { apiRequest, CLAVE_TOKEN } from './api.js'
import { claveCarritoActual } from '../datos/carritoPorCuenta.js'

const CLAVE_CARRITO_INVITADO = 'carrito_huerto_invitado'
let sincronizacionEnCurso = null

// GUÍA: Comprueba si hay un token en sessionStorage; el servidor valida su autenticidad.
function tieneSesion() {
  return Boolean(sessionStorage.getItem(CLAVE_TOKEN))
}

// GUÍA: Notifica cambio según los datos recibidos.
function notificarCambio() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('carritoActualizado'))
  }
}

// GUÍA: Lee clave local según los datos recibidos.
function leerClaveLocal(clave) {
  try {
    const datos = JSON.parse(localStorage.getItem(clave) || '[]')
    return Array.isArray(datos) ? datos : []
  } catch {
    return []
  }
}

// GUÍA: Guarda clave local según los datos recibidos.
function guardarClaveLocal(clave, productos) {
  localStorage.setItem(clave, JSON.stringify(productos))
}

// GUÍA: Adapta la respuesta del servidor al formato del carrito de React y calcula el precio con descuento.
function normalizarItemServidor(item) {
  const precioOriginal = Number(item.precio) || 0
  const descuento = Boolean(item.descuento)
  const descuentoPorcentaje = Number(item.descuentoPorcentaje) || 0
  const precio = descuento
    ? Math.round(precioOriginal * (1 - descuentoPorcentaje / 100))
    : precioOriginal

  return {
    id: item.codigo || String(item.id),
    backendId: Number(item.id),
    codigo: item.codigo || String(item.id),
    nombre: item.nombre || 'Producto',
    categoria: item.categoria || 'Otros',
    precio,
    precioOriginal,
    descuento,
    descuentoPorcentaje,
    stock: Number(item.stock) || 0,
    unidad: item.unidad || 'unidad',
    plural: item.plural || 'unidades',
    imagen: item.imagen || '/img/verduras.webp',
    descripcion: item.descripcion || '',
    cantidad: Number(item.cantidad) || 1,
    itemCarritoId: item.itemCarritoId,
  }
}

// GUÍA: Uniforma los tipos de datos del artículo almacenado localmente.
function normalizarItemLocal(item) {
  return {
    ...item,
    id: item.id ?? item.codigo,
    cantidad: Number(item.cantidad) || 1,
    precio: Number(item.precio) || 0,
    stock: Number(item.stock) || 0,
  }
}

// GUÍA: Busca la coincidencia de un artículo en el catálogo del servidor.
function resolverProductoCatalogo(item, catalogo) {
  const idBackend = item.backendId ?? item.productoId
  const identificador = String(item.codigo ?? item.id ?? '').trim()
  const nombre = String(item.nombre ?? '').trim().toLowerCase()

  return catalogo.find(producto =>
    (idBackend != null && Number(producto.id) === Number(idBackend)) ||
    (identificador && String(producto.codigo || '') === identificador) ||
    (identificador && String(producto.id) === identificador) ||
    (nombre && String(producto.nombre || '').trim().toLowerCase() === nombre)
  )
}

// GUÍA: Obtiene el identificador numérico del producto utilizado por la API.
async function resolverIdBackend(producto) {
  const directo = producto.backendId ?? producto.productoId
  if (directo != null && Number.isFinite(Number(directo))) {
    return Number(directo)
  }

  const catalogo = await consultarCatalogo()
  const encontrado = resolverProductoCatalogo(producto, Array.isArray(catalogo) ? catalogo : [])
  if (!encontrado?.id) {
    throw new Error(`No se encontró ${producto.nombre || 'el producto'} en el catálogo del servidor.`)
  }
  return Number(encontrado.id)
}

// Migra el carrito de invitado al usuario autenticado. Cada elemento se
// elimina del almacenamiento local solo después de que el backend confirma su recepción.
// GUÍA: Transfiere artículos locales al carrito del servidor y elimina los datos migrados tras confirmación.
async function sincronizarCarritoInvitado() {
  if (!tieneSesion()) return
  if (sincronizacionEnCurso) return sincronizacionEnCurso

  sincronizacionEnCurso = (async () => {
    const claveCuenta = claveCarritoActual()
    const claveMigracion = `${claveCuenta}_migrado_backend_v1`
    const carritoCuentaPendiente = claveCuenta !== CLAVE_CARRITO_INVITADO &&
      localStorage.getItem(claveMigracion) !== 'true'
      ? leerClaveLocal(claveCuenta)
      : []
    const carritoInvitadoPendiente = leerClaveLocal(CLAVE_CARRITO_INVITADO)

    if (carritoCuentaPendiente.length === 0 && carritoInvitadoPendiente.length === 0) {
      if (claveCuenta !== CLAVE_CARRITO_INVITADO) localStorage.setItem(claveMigracion, 'true')
      return
    }

    const catalogo = await consultarCatalogo()
    const productosServidor = await apiRequest('/api/v1/carrito')
    const idsServidor = new Set(
      (Array.isArray(productosServidor) ? productosServidor : []).map(item => Number(item.id))
    )

    // Migra una sola vez el carrito local por cuenta de la versión anterior.
    // Si el producto ya está en MySQL, se conserva la cantidad del servidor.
    const cuentaRestante = [...carritoCuentaPendiente]
    while (cuentaRestante.length > 0) {
      const item = cuentaRestante[0]
      const producto = resolverProductoCatalogo(item, Array.isArray(catalogo) ? catalogo : [])
      if (!producto?.id) {
        throw new Error(`No se pudo recuperar ${item.nombre || 'un producto'} del carrito anterior.`)
      }
      if (!idsServidor.has(Number(producto.id))) {
        await apiRequest('/api/v1/carrito', {
          method: 'POST',
          body: JSON.stringify({ productoId: Number(producto.id), cantidad: Number(item.cantidad) || 1 }),
        })
        idsServidor.add(Number(producto.id))
      }
      cuentaRestante.shift()
      guardarClaveLocal(claveCuenta, cuentaRestante)
    }
    if (claveCuenta !== CLAVE_CARRITO_INVITADO) {
      localStorage.removeItem(claveCuenta)
      localStorage.setItem(claveMigracion, 'true')
    }

    // El carrito de invitado es independiente; sus cantidades se suman
    // al carrito persistente del usuario que acaba de iniciar sesión.
    const invitadoRestante = [...carritoInvitadoPendiente]
    while (invitadoRestante.length > 0) {
      const item = invitadoRestante[0]
      const producto = resolverProductoCatalogo(item, Array.isArray(catalogo) ? catalogo : [])
      if (!producto?.id) {
        throw new Error(`No se pudo sincronizar ${item.nombre || 'un producto'} del carrito de invitado.`)
      }
      await apiRequest('/api/v1/carrito', {
        method: 'POST',
        body: JSON.stringify({ productoId: Number(producto.id), cantidad: Number(item.cantidad) || 1 }),
      })
      invitadoRestante.shift()
      guardarClaveLocal(CLAVE_CARRITO_INVITADO, invitadoRestante)
    }
    if (carritoInvitadoPendiente.length > 0) {
      localStorage.removeItem(CLAVE_CARRITO_INVITADO)
    }

    if (carritoCuentaPendiente.length > 0 || carritoInvitadoPendiente.length > 0) notificarCambio()
  })()

  try {
    await sincronizacionEnCurso
  } finally {
    sincronizacionEnCurso = null
  }
}

// GUÍA: Consulta el carrito del servidor si hay sesión; de lo contrario usa el carrito de invitado.
export async function obtenerCarritoActual() {
  if (!tieneSesion()) {
    return leerClaveLocal(CLAVE_CARRITO_INVITADO).map(normalizarItemLocal)
  }

  await sincronizarCarritoInvitado()
  const respuesta = await apiRequest('/api/v1/carrito')
  return (Array.isArray(respuesta) ? respuesta : []).map(normalizarItemServidor)
}

// GUÍA: Valida cantidad y disponibilidad y agrega el artículo al carrito correspondiente.
export async function agregarProductoAlCarrito(producto, cantidad = 1) {
  const cantidadAgregar = Number(cantidad)
  if (!Number.isInteger(cantidadAgregar) || cantidadAgregar < 1) {
    throw new Error('La cantidad debe ser un número mayor que cero.')
  }
  if (producto.pendiente) throw new Error('Este producto todavía no está disponible para la venta.')
  if (Number(producto.stock) < 1) throw new Error('Este producto no tiene stock disponible.')

  if (tieneSesion()) {
    const productoId = await resolverIdBackend(producto)
    await apiRequest('/api/v1/carrito', {
      method: 'POST',
      body: JSON.stringify({ productoId, cantidad: cantidadAgregar }),
    })
    notificarCambio()
    return obtenerCarritoActual()
  }

  const carrito = leerClaveLocal(CLAVE_CARRITO_INVITADO)
  const clave = String(producto.backendId ?? producto.codigo ?? producto.id)
  const existente = carrito.find(item =>
    String(item.backendId ?? item.codigo ?? item.id) === clave
  )
  const nuevaCantidad = (Number(existente?.cantidad) || 0) + cantidadAgregar
  if (Number(producto.stock) > 0 && nuevaCantidad > Number(producto.stock)) {
    throw new Error(`No puedes superar el stock disponible de ${producto.nombre}.`)
  }

  if (existente) {
    existente.cantidad = nuevaCantidad
    existente.precio = producto.precioFinal ?? producto.precio
    existente.stock = producto.stock
  } else {
    carrito.push({
      ...producto,
      id: producto.id ?? producto.codigo,
      backendId: producto.backendId ?? null,
      codigo: producto.codigo ?? producto.id,
      precio: producto.precioFinal ?? producto.precio,
      cantidad: cantidadAgregar,
    })
  }
  guardarClaveLocal(CLAVE_CARRITO_INVITADO, carrito)
  notificarCambio()
  return carrito.map(normalizarItemLocal)
}

// GUÍA: Actualiza la cantidad de un artículo en el servidor o almacenamiento local.
export async function actualizarCantidadCarrito(producto, cantidad) {
  const nuevaCantidad = Number(cantidad)
  if (!Number.isInteger(nuevaCantidad) || nuevaCantidad < 1) {
    throw new Error('La cantidad mínima es 1.')
  }

  if (tieneSesion()) {
    const productoId = await resolverIdBackend(producto)
    await apiRequest(`/api/v1/carrito/${productoId}`, {
      method: 'PUT',
      body: JSON.stringify({ cantidad: nuevaCantidad }),
    })
    notificarCambio()
    return obtenerCarritoActual()
  }

  const carrito = leerClaveLocal(CLAVE_CARRITO_INVITADO)
  const clave = String(producto.backendId ?? producto.codigo ?? producto.id)
  const actualizado = carrito.map(item => {
    const itemClave = String(item.backendId ?? item.codigo ?? item.id)
    return itemClave === clave ? { ...item, cantidad: nuevaCantidad } : item
  })
  guardarClaveLocal(CLAVE_CARRITO_INVITADO, actualizado)
  notificarCambio()
  return actualizado.map(normalizarItemLocal)
}

// GUÍA: Retira el artículo del carrito correspondiente.
export async function eliminarProductoCarrito(producto) {
  if (tieneSesion()) {
    const productoId = await resolverIdBackend(producto)
    await apiRequest(`/api/v1/carrito/${productoId}`, { method: 'DELETE' })
    notificarCambio()
    return obtenerCarritoActual()
  }

  const clave = String(producto.backendId ?? producto.codigo ?? producto.id)
  const actualizado = leerClaveLocal(CLAVE_CARRITO_INVITADO).filter(item =>
    String(item.backendId ?? item.codigo ?? item.id) !== clave
  )
  guardarClaveLocal(CLAVE_CARRITO_INVITADO, actualizado)
  notificarCambio()
  return actualizado.map(normalizarItemLocal)
}

// GUÍA: Elimina todos los artículos del carrito correspondiente.
export async function vaciarCarritoActual() {
  if (tieneSesion()) {
    await apiRequest('/api/v1/carrito', { method: 'DELETE' })
  } else {
    localStorage.removeItem(CLAVE_CARRITO_INVITADO)
  }
  notificarCambio()
  return []
}
