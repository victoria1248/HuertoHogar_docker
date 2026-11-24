// GUÍA: Filtra por categoría y texto; limita las tarjetas renderizadas, no los datos del servidor.
export function normalizarBusqueda(valor) {
  return String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}
export function filtrarCatalogo(productos, categoria, busqueda) {
  const termino = normalizarBusqueda(busqueda)
  return productos.filter(p => (!categoria || p.categoria === categoria) &&
    (!termino || normalizarBusqueda(`${p.nombre} ${p.codigo ?? p.id ?? ''}`).includes(termino)))
}
export function paginarCatalogo(productos, pagina, porPagina = 12) {
  const total = Math.max(1, Math.ceil(productos.length / porPagina))
  const actual = Math.max(1, Math.min(pagina, total))
  return { elementos: productos.slice((actual - 1) * porPagina, actual * porPagina), actual, total }
}
