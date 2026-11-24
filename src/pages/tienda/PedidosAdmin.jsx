// GUÍA: Permite consultar pedidos y cambiar su estado desde administración.
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { apiRequest } from '../../servicios/api.js'
import MenuAdminCompartido from '../../componentes/tienda/MenuAdminCompartido.jsx'

const dinero = valor => '$' + Number(valor || 0).toLocaleString('es-CL')
const fecha = valor => {
  const date = new Date(valor)
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleString('es-CL')
}

// GUÍA: Permite consultar pedidos y cambiar su estado desde administración.
export default function PedidosAdmin() {
  const { usuario } = useAuth()
  const esAdmin = usuario?.rol === 'admin'
  // GUÍA: Estado de React: conserva los valores de esta sección y vuelve a renderizar al actualizarlos.
  const [pedidos, setPedidos] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [motivos, setMotivos] = useState({})

  // GUÍA: Carga los registros de esta sección según los datos recibidos.
  async function cargar() {
    setCargando(true)
    try {
      const lista = await apiRequest('/api/v1/boletas')
      setPedidos(Array.isArray(lista) ? lista : [])
      setError('')
    } catch (err) { setError(err.message || 'No se pudieron cargar las órdenes.') }
    finally { setCargando(false) }
  }

  // GUÍA: Efecto de React: ejecuta la sincronización o suscripción de este bloque según sus dependencias; revisar la limpieza al desmontar.
  useEffect(() => { cargar() }, [])

  // GUÍA: Muestra detalle según los datos recibidos.
  async function verDetalle(id) {
    try {
      const detalle = await apiRequest(`/api/v1/boletas/${id}`)
      setSeleccionado(detalle)
    } catch (err) { setError(err.message || 'No se pudo recuperar el detalle de la boleta.') }
  }

  // GUÍA: Modifica estado según los datos recibidos.
  async function cambiarEstado(id, estado) {
    const motivo = String(motivos[id] || '').trim()
    if (estado === 'Suspendido' && motivo.length < 5) {
      setMensaje('Para suspender una orden escribe un motivo de al menos 5 caracteres.')
      return
    }
    try {
      const actualizado = await apiRequest(`/api/v1/boletas/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado, motivoSuspension: estado === 'Suspendido' ? motivo : '' })
      })
      setPedidos(lista => lista.map(p => String(p.id) === String(id) ? actualizado : p))
      if (String(seleccionado?.id) === String(id)) setSeleccionado(actualizado)
      setMensaje(`La boleta ${actualizado.folio || id} fue actualizada.`)
    } catch (err) { setMensaje(err.message || 'No se pudo actualizar el estado.') }
  }

  const filtrados = pedidos.filter(p => `${p.folio || p.id} ${p.correoCuenta || ''} ${p.cliente?.nombre || ''}`.toLowerCase().includes(busqueda.toLowerCase()))

  return (
    <main style={{ minHeight: '100vh', background: '#f4f7f3', color: '#18392b', padding: '30px 18px' }}>
      {esAdmin && <MenuAdminCompartido />}
      <div className="container" style={{ maxWidth: 1180 }}>
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div><span className="text-success fw-bold">HUERTOHOGAR · {esAdmin ? 'ADMINISTRACIÓN' : 'VENDEDOR'}</span><h1 className="fw-bold mt-1">Órdenes y boletas</h1><p className="text-secondary mb-0">Consulta de compras registradas y sus detalles persistidos en MySQL.</p></div>
          <button className="btn btn-outline-success" onClick={cargar}>↻ Actualizar lista</button>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        {mensaje && <div className="alert alert-info">{mensaje}</div>}
        <div className="row g-4">
          <section className="col-12 col-lg-7">
            <div className="bg-white rounded-4 shadow-sm p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center gap-2 mb-3"><h2 className="h5 fw-bold mb-0">Listado de órdenes</h2><span className="badge text-bg-success">{pedidos.length} registros</span></div>
              <input className="form-control mb-3" placeholder="Buscar por folio, cliente o correo" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
              {cargando ? <p role="status">Cargando órdenes…</p> : filtrados.length === 0 ? <p className="text-secondary">No hay órdenes que mostrar.</p> : (
                <div className="d-grid gap-3">
                  {filtrados.map(p => <article key={p.id} className="border rounded-3 p-3">
                    <div className="d-flex justify-content-between gap-3"><div><strong>{p.folio || `Boleta ${p.id}`}</strong><div className="small text-secondary">{fecha(p.fecha)}</div><div className="small mt-1">{p.cliente?.nombre || 'Cliente'} · {p.correoCuenta || p.cliente?.correo}</div></div><div className="text-end"><strong>{dinero(p.total)}</strong><div><span className="badge text-bg-light border mt-1">{p.estado}</span></div></div></div>
                    <button className="btn btn-sm btn-outline-success mt-3" onClick={() => verDetalle(p.id)}>Ver detalle de la orden</button>
                    {esAdmin && <div className="row g-2 mt-2 align-items-end"><div className="col-12 col-md-5"><label className="form-label small">Actualizar estado<select className="form-select form-select-sm" value={p.estado || 'Pedido confirmado'} onChange={e => cambiarEstado(p.id, e.target.value)}><option>Pedido confirmado</option><option>Preparando pedido</option><option>En camino</option><option>Entregado</option><option>Suspendido</option></select></label></div><div className="col-12 col-md-7"><label className="form-label small">Motivo si se suspende<input className="form-control form-control-sm" value={motivos[p.id] ?? p.motivoSuspension ?? ''} onChange={e => setMotivos(v => ({ ...v, [p.id]: e.target.value }))} placeholder="Motivo de suspensión" /></label></div></div>}
                  </article>)}
                </div>
              )}
            </div>
          </section>
          <section className="col-12 col-lg-5">
            <div className="bg-white rounded-4 shadow-sm p-3 p-md-4 h-100">
              <h2 className="h5 fw-bold mb-3">Detalle de boleta</h2>
              {!seleccionado ? <p className="text-secondary">Selecciona una orden para consultar sus productos, entrega y pago.</p> : <>
                <div className="d-flex justify-content-between gap-2"><strong>{seleccionado.folio || `Boleta ${seleccionado.id}`}</strong><span className="badge text-bg-success">{seleccionado.estado}</span></div>
                <p className="small text-secondary">{fecha(seleccionado.fecha)}</p>
                <hr />
                <p className="mb-1"><b>Cliente:</b> {seleccionado.cliente?.nombre}</p><p className="mb-1"><b>Correo:</b> {seleccionado.cliente?.correo}</p><p className="mb-1"><b>Teléfono:</b> {seleccionado.cliente?.telefono}</p>
                <p className="mb-1"><b>Entrega:</b> {[seleccionado.entrega?.calle, seleccionado.entrega?.numero, seleccionado.entrega?.comuna, seleccionado.entrega?.region].filter(Boolean).join(', ')}</p>
                <p className="mb-1"><b>Pago:</b> {seleccionado.pago?.metodo} · {seleccionado.pago?.estado}</p>
                <hr /><h3 className="h6 fw-bold">Productos</h3>
                {(seleccionado.productos || []).map((item, i) => <div key={`${item.codigo}-${i}`} className="d-flex justify-content-between gap-2 border-bottom py-2"><span>{item.nombre} × {item.cantidad}</span><strong>{dinero(item.subtotal)}</strong></div>)}
                <div className="d-flex justify-content-between mt-3"><span>Subtotal</span><strong>{dinero(seleccionado.subtotal)}</strong></div><div className="d-flex justify-content-between"><span>Envío</span><strong>{dinero(seleccionado.envio)}</strong></div><div className="d-flex justify-content-between fs-5 mt-2"><b>Total</b><b>{dinero(seleccionado.total)}</b></div>
              </>}
            </div>
          </section>
        </div>
        <a href={esAdmin ? '/dashboard' : '/'} className="d-inline-block mt-4 text-success fw-bold">← Volver</a>
      </div>
    </main>
  )
}
